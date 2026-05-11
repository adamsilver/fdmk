# Multi-file upload: GOV.UK component vs. custom AJAX component

## How the GOV.UK enhancement works

- Hides the real `<input type="file">` and replaces it visually with a `<button>`.
- Clicking the button calls `this.$input.click()` to open the file picker.
- Dropping files onto the button assigns them to the input: `this.$input.files = event.dataTransfer.files`.
- On change, status text updates to show the filename(s). Files submit with the form normally — no AJAX, no convention broken.

This was made possible by `HTMLInputElement.files` becoming **writable** in modern browsers. In IE it was read-only, so drag-and-drop files couldn't be assigned to an input for normal form submission — AJAX was the only option. `onchange` also now fires immediately on selection without requiring blur.

## How my enhancement works

- Wraps the input in a dropzone and appends a `<label>` styled as a button.
- On `change` or `drop`, files are immediately uploaded via sequential AJAX calls.
- Each uploaded file accumulates server-side with a delete button.
- Files are already on the server by the time the user continues — not held for form submission.

## Triggering the file picker: labels vs. script clicks

The file picker is an **activation-gated API** — per the HTML Living Standard, it requires **Transient User Activation** (a user gesture) to open. This activation has a short expiration window.

When using `input.click()` from JavaScript, the call must land within the synchronous execution stack of the user event. Any gap — an async microtask, a `setTimeout`, or heavy main-thread work — can expire the activation, causing the browser to silently block the dialog. Script-initiated activations can also be consumed if other privileged actions run first.

A `<label for="id">` association sidesteps this entirely. The browser forwards the click to the input at its internal (C++) layer and opens the file dialog as the **default action** of the resulting click event — without depending on JS to trigger it. This means no JS activation to expire, and it works before JavaScript initialises — genuine progressive enhancement.

This immunity is specific to the file-dialog-triggering mechanism. Attaching heavy synchronous work to `fileinput.onclick` would still freeze the main thread before the dialog appears — a general performance problem. And `e.preventDefault()` in any handler cancels the default action and blocks the dialog entirely.

GOV.UK's `onClick` is synchronous and works in practice:
```js
onClick() { this.$input.click(); }
```
But it is a narrower guarantee. Any async gap in that handler — a Promise, `setTimeout`, or heavy work before the `input.click()` call — can expire the transient activation on Safari or mobile, silently blocking the dialog. The label carries no such risk.

## The problem with the GOV.UK enhancement: replacement, not accumulation

The GOV.UK component does not accumulate files across multiple interactions. Each new selection or drop replaces the previously selected files. This applies to both interaction modes:

- **File picker**: the user selects files, then opens the picker again and selects more. The second selection replaces the first.
- **Drag-and-drop**: each drop calls `this.$input.files = event.dataTransfer.files`, overwriting whatever was there before.

This means users can only submit files from a single interaction — a problem if they need files from different folders.

## DataTransfer

`DataTransfer` is the browser's container for data being moved. When a user drags files from their OS, the browser wraps those files in a `DataTransfer` object attached to the drag event as `event.dataTransfer`. Its `.files` property is a `FileList` — the same type as `input.files`. That's why `this.$input.files = event.dataTransfer.files` works: it moves the files from the drag event into the input.

You can also construct one programmatically: `new DataTransfer()` lets you add `File` objects via `dt.items.add(file)`, producing a new `FileList` via `dt.files`.

`FileList` is immutable — there is no append API. But by maintaining a persistent `DataTransfer` object, you can accumulate files across multiple picker sessions and drops:

```js
const dt = new DataTransfer();

input.addEventListener('change', () => {
  for (const file of input.files) dt.items.add(file);
  input.files = dt.files;
});

dropzone.addEventListener('drop', e => {
  e.preventDefault();
  for (const file of e.dataTransfer.files) dt.items.add(file);
  input.files = dt.files;
});
```

When `onchange` fires, `input.files` already contains only the new selection — but the persistent `dt` still holds everything accumulated so far. The reassignment doesn't trigger another `onchange` (that only fires on user interaction, not programmatic writes). This solves the multi-folder problem: files from different folders can be accumulated across multiple interactions before submission.

**Caveats:**
- **Duplicates**: selecting the same file twice adds it twice. Needs deduplication (name + size + `lastModified`).
- **Same-file `onchange` problem**: if identical files are selected again, `onchange` may not fire at all.
- **Removal UI**: letting users remove individual files requires a separate UI that also removes from `dt.items`.

## Why AJAX is still better for multi-session upload

The DataTransfer approach queues files in memory. The user needs a UI showing what is queued and waiting to be uploaded — meaningfully different from what the AJAX component shows: files already uploaded and confirmed on the server.

With AJAX, each batch uploads immediately, is confirmed, and persists server-side. The user can close the tab and their files aren't lost. Uploads are distributed across selections — no single large request at submit time.

With DataTransfer, everything is held in memory until form submission. A page refresh or crash loses everything. All files upload in one request at submit time, which is slower and gives worse perceived performance than incremental AJAX uploads.

## Why the custom component uploads immediately

The book (*Form Design Patterns*) documents three problems with uploading on `onchange`/`ondrop` that existed when the component was written:

1. **IE wouldn't trigger the dialog via a label in the context of immediate upload** — the overall pattern of uploading immediately on `onchange`/`ondrop` didn't work cross-browser, and IE was one symptom. The custom component uses a label precisely because it is the more reliable and broadly supported trigger — working before JS initialises and in as many browsers as possible.
2. **Same file selected twice doesn't fire `onchange`** — the fix is to clone and replace the input, but the clone needs refocusing, causing screen readers to re-announce it.
3. **`onchange` didn't fire until blur** — `oninput` was the fix but wasn't universally supported.

The component's feature detection (`dragAndDropSupported`, `formDataSupported`, `fileApiSupported`) ruled out the offending browsers in practice. All three problems were essentially IE problems; IE has been dead since 2022.

Immediate upload also solves the multi-folder problem. The native file picker only browses one folder at a time. With AJAX upload, each selection is sent to the server and accumulated across multiple interactions, so files from different folders can be included. The DataTransfer accumulation approach also solves this, but with the trade-offs documented above. The plain GOV.UK approach — no accumulation — means only files from the last interaction are submitted.

After each AJAX upload, focus returns to the file input, keeping keyboard users in a continuous loop without needing to navigate back. This treats repeated file selection as a single sustained interaction.

## Browser support

**Custom AJAX component** — gated by feature detection for drag-and-drop (`ondrop`), `FormData`, and the File API (`input.files`). All three have been supported in Chrome, Firefox, and Safari since around 2010. The enhancement runs in all modern browsers. IE10+ technically passed the detection but had the problems documented above; IE is dead as of 2022.

**GOV.UK FileUpload component** — the button/picker flow works in all modern browsers. The drag-and-drop path requires writable `input.files`: supported in Chrome and Firefox since roughly 2017–2019, and in Safari since **14.1 (April 2021 / iOS 14.5)**. Not supported in IE. The component also uses `MutationObserver` (IE11+, all modern browsers) and `DataTransfer.items` (Chrome 13+, Firefox 50+, Safari 11.1+).

**DataTransfer accumulation approach** — the same Safari 14.1+ constraint applies. The `new DataTransfer()` constructor is supported in Chrome, Firefox 62+, and Safari 14.1+. Writable `input.files` is the binding requirement. If Safari 14.1+ is acceptable (now over four years old), no additional feature detection is needed. If older Safari must be supported, you'd need to detect and fall back.

## Historical security context

`input.files` was originally read-only to prevent JavaScript from injecting arbitrary file paths for upload without user consent. Now that it's writable, the boundary holds differently: a `FileList` containing real files from disk can only come from a genuine user gesture (file picker or OS drag). Synthetic `File` objects created via `new File(['content'], 'name')` are just blobs — they don't reference files on disk. JavaScript still cannot read and re-upload arbitrary local files.

## To investigate

- Whether the multi-folder problem is common enough in practice to justify the convention break in the custom component
- Whether the UX difference between "files queued" (DataTransfer) and "files confirmed uploaded" (AJAX) matters for the specific use case — and whether the single large upload at submit time is a practical performance concern
- What happens if the user clicks Continue while an AJAX upload is still in progress — there is currently no guard against this in the custom component

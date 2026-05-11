# Multi-file upload: focus after upload

## Issue

As soon as a file is selected and the AJAX request is initiated, focus is moved back to the (hidden) file input (`this.fileInput.focus()` in `onFileChange`). This causes the "Choose files" label to visually highlight with the GOV.UK focus colour, which can feel jarring since the user didn't explicitly move focus there.

## Why it exists

This is intentional — moving focus back to the file input allows keyboard users to immediately upload another file without having to navigate back to the control.

## Book notes on older browser support

Uploading files immediately `onchange`/`ondrop` is not just a convention issue — it has cross-browser problems:

1. Some older browsers won't trigger the file dialog when a label is used as a proxy for the input.
2. Choosing the same file (or a file with the same name) a second time won't fire the `onchange` event, breaking the interface. The fix is to replace the file input with a clone after the event fires — but the cloned input would need to be refocused, causing screen readers to announce it a second time (mildly annoying).
3. The `onchange` event won't fire until the field is blurred. Newer browsers offer `oninput`, which fires immediately on value change.

The feature detection used in the component happens to rule out the offending older browsers, so these issues may not apply in practice.

## Simplification opportunity

The clone fix in `onFileChange` was needed because IE made `input[type=file].value` read-only, so clearing it programmatically didn't work — replacing the element with a clone was the only way to reset it. IE is the browser behind all three issues listed above, and it's been dead since 2022.

In modern browsers, `input[type=file].value = ''` works fine. The clone can be removed and replaced with a simple value clear:

```js
App.MultiFileUpload.prototype.onFileChange = function(e) {
  this.status.html(this.params.uploadStatusText);
  this.uploadFiles(e.currentTarget.files);
  this.fileInput.val('');
  this.fileInput.focus();
};
```

This also removes the need to call `this.setupFileInput()` since the element is no longer replaced.

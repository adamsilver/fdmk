# Multi-file upload: inline error accessibility problem

## The problem

The no-JS version of the multi-file upload can produce multiple errors at once — one per rejected file. The GOV.UK Design System's error message component only expects a single error per field, so multiple errors are currently joined with `<br>` tags.

This is inaccessible. The error message element is referenced by the input via `aria-describedby`, which causes the browser to flatten its entire content into a plain text string. Semantic HTML inside that element — including `<ul>`, `<li>`, and `<br>` — is stripped. Everything reads as one continuous sentence.

Using a `<ul>` list inside the error message does **not** fix this, even though it looks better visually. Screen readers will not announce list structure when reading `aria-describedby` content.

## Why this case is unusual

Every other field in the design system shows at most one error at a time. This is the recommended pattern and it works well. Multi-file upload is a special case because a single submission can result in multiple distinct errors — one per file — all associated with the same field.

## Options considered

### 1. Punctuation as separators

Ensure each error message ends with a full stop, then join them with a space:

```
foo.png must be a PNG. bar.png must be smaller than 1MB.
```

Screen readers pause at sentence boundaries, so this is marginally better than a run-on. Still not ideal for long lists of errors.

### 2. Generic inline error + detailed error summary (recommended)

- The inline error simply says something like `"One or more files could not be uploaded"`
- The error summary, which renders as a proper `<ul>` list outside of any `aria-describedby` relationship, lists each individual per-file error

This matches the intent of both components. The error summary is designed for listing multiple problems; the inline error is a pointer to where the problem is. This approach requires no hacks.

### 3. Multiple `aria-describedby` IDs

Each error gets its own element with a unique ID, and all IDs are listed in the input's `aria-describedby` attribute. Screen readers announce each referenced element separately, preserving the distinction between errors.

This would work, but the GOV.UK file upload macro does not support it out of the box. It would require a custom macro or manual HTML.

## Current state

Not yet resolved. Option 2 is the preferred approach to investigate and implement.

## Relevant files

- `app/routes/multi-upload-file.js` — where errors are currently joined with `<br>` (line 26)
- `app/views/multi-file-upload.html` — the template, using `govukFileUpload` and `govukErrorSummary`

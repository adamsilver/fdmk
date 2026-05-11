# Multi-file upload: XSS via unescaped filename in error message

## The problem

The current code passes error messages as raw HTML via the `html` property of `errorMessage`:

```js
// app/routes/multi-upload-file.js
const messages = rejectedFiles.map(item => item.error.message);
pageObject.errorMessage = { html: messages.join('<br>') };
```

The error messages are constructed by interpolating the original filename directly from the upload:

```js
FILE_TYPE: (filename) => `${filename} must be a PNG, GIF or JPEG`,
LIMIT_FILE_SIZE: (filename) => `${filename} must be smaller than 1mb`,
```

A user could upload a file named `<img src=x onerror=alert(1)>.png`. That string would be embedded unescaped into the HTML string, which Nunjucks then renders as raw HTML. This is a reflected XSS vector.

The same risk applies to the error summary items, which currently use `text:` (safe), but would become a vector if ever switched to `html:`.

## Fix

HTML-escape filenames before interpolating them into error message strings. Node has no built-in HTML escaper, but a minimal one is sufficient:

```js
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
```

Or use a library like `he` or `escape-html`.

Separately, if the generic inline error approach is adopted (see `multi-file-upload-error-accessibility.md`), filenames would no longer appear in the inline error message at all, which eliminates this vector for that message. The error summary uses `text:` and is safe as long as it stays that way.

## Current state

Not yet resolved.

## Relevant files

- `app/routes/multi-upload-file.js` — where filenames are interpolated unescaped into `html:` strings

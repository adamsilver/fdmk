# Multi-file upload: why AJAX errors use inline rows, not the standard error pattern

## The standard error pattern and why it doesn't fit

The GOV.UK Design System's error pattern — error summary at the top of the page, field-level error below the input — is designed for synchronous form submission. The flow is:

1. User submits the form
2. Page reloads at the top
3. Error summary presents all errors at once, with links back to the relevant fields
4. User fixes the errors and resubmits

This pattern assumes a page reload and a discrete validation moment. Neither applies to AJAX file upload.

## Why AJAX is a different context

With AJAX, uploads happen sequentially without a page reload. Each file is uploaded independently and gets an immediate result — success or failure — while the user remains on the page. There is no single validation moment; errors can arrive one at a time, interleaved with successes.

This means:

- There is no "top of page" to reload to, so no natural place to anchor an error summary
- Errors are per-file, not whole-form failures — they belong alongside the specific file they relate to
- A summary would need to be injected and updated dynamically as each upload completes, adding significant JS complexity for no UX gain

## Why moving focus to an error summary would be harmful

Even if an error summary were injected via JS, moving focus to it after an upload fails would pull the user away from the file input. They would then need to navigate back to upload another file or retry. This would actively interrupt the upload flow.

The aria-live region handles the screen reader announcement without touching focus. The user stays on the file input after every upload result — success or failure — and can continue uploading immediately.

## Why inline rows work well

Showing each upload result as a row in the file list is appropriate because:

- The error is contextually tied to the specific file that caused it
- Successes and failures are visible side by side — the user can see exactly which files worked and which did not
- No focus management is needed; the aria-live region announces each outcome as it happens
- The implementation is simpler and has no dynamic state to manage across multiple uploads

## Summary

The standard error pattern is the right choice for the no-JS path (synchronous submission). Inline rows are the right choice for the AJAX path (live sequential uploads). They are different interaction models and should be treated differently.

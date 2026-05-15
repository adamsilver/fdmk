# Communicating pre-populated file upload state to screen readers

File inputs cannot be pre-populated by the browser for security reasons. 

If a user submits a form that includes a file upload alongside other fields, and validation fails on one of the other fields, the file input resets. 

Without intervention, the user has to upload the file again even though the server already received it successfully.

One part of the fix is to store the file in session on the server. 

The harder question is how to communicate that state to all users — including screen reader users in forms mode, who tab through inputs and only hear what is announced by the focused element.

## Single file input

When a file is already held in session, change the hint text:

> "receipt.jpg already uploaded."

The hint is linked to the input via `aria-describedby`, so in forms mode a screen reader announces: 

> "Upload a receipt, file input, receipt.jpg already uploaded."

The input is still native, still operable, no custom treatment needed.

Server logic:
- File input empty on submit + file held in session → keep the held file, no error
- New file submitted → replace the held file

## Multi-file upload

The same principle applies but the hint text changes to accomodate multiple files when there's more than one file uploaded:

> "3 files already uploaded."

The list of uploaded files displayed above the input serves sighted users and screen reader users browsing outside forms mode. The hint gives forms-mode users the same essential context without requiring them to navigate away from the input.

Use the count when there are multiple files. 

Use the name the file when there’s exactly one — that mirrors the single-file pattern and is more precise without becoming verbose.

## Why not a read-only row or custom element

A custom read-only treatment (e.g. a filename displayed as plain text or a summary list row) is skipped in forms mode because it is not an input. Screen readers navigating by tab will not land on it, so the information is invisible to those users. The native file input with dynamic hint text is the right vehicle — it is always in the tab order and always announces its associated hint.

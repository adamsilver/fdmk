const fs = require('fs');
const { formidable } = require('formidable');
const { get, set, remove } = require('lodash');

class FileUpload {
  constructor({ fieldName, allowedTypes, maxFileSize, uploadDir = '.tmp/uploads/', errors = {} }) {
    this.fieldName = fieldName;
    this.allowedTypes = allowedTypes;
    this.maxFileSize = maxFileSize;
    this.uploadDir = uploadDir;
    this.errors = errors;
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  getErrorMessage(code, filename) {
    return this.errors[code] ? this.errors[code](filename) : '';
  }

  mapFile(f) {
    return {
      originalname: f.originalFilename,
      filename: f.newFilename,
      path: f.filepath,
      size: f.size
    };
  }

  parse(req) {
    const rejected = [];
    const fileTypeErrors = [];

    const form = formidable({
      uploadDir: this.uploadDir,
      filter: ({ originalFilename, mimetype }) => {
        if (!originalFilename) {
          return false;
        }
        if (!this.allowedTypes.includes(mimetype)) {
          fileTypeErrors.push(originalFilename);
          return false;
        }
        return true;
      }
    });

    return new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          return reject(err);
        }

        for (const filename of fileTypeErrors) {
          rejected.push({
            file: { originalname: filename },
            error: { code: 'FILE_TYPE', message: this.getErrorMessage('FILE_TYPE', filename) }
          });
        }

        const deleteFilename = fields.delete?.[0];
        const fieldFiles = get(files, this.fieldName);
        const allFiles = fieldFiles ? [].concat(fieldFiles).map(f => this.mapFile(f)) : [];

        const uploaded = allFiles.filter((file) => {
          if (file.size > this.maxFileSize) {
            rejected.push({
              file: { originalname: file.originalname },
              error: { code: 'LIMIT_FILE_SIZE', message: this.getErrorMessage('LIMIT_FILE_SIZE', file.originalname) }
            });
            return false;
          }
          return true;
        });

        if (!deleteFilename && uploaded.length === 0 && rejected.length === 0) {
          rejected.push({
            file: { originalname: '' },
            error: { code: 'NO_FILE', message: this.getErrorMessage('NO_FILE') }
          });
        }

        resolve({ uploaded, rejected, deleteFilename });
      });
    });
  }
}

function getUploadedFiles(fieldName) {
  return function(req, res, next) {
    if (!get(req.session, fieldName)) {
      set(req.session, fieldName, []);
    }
    req.uploadedFiles = get(req.session, fieldName);
    next();
  };
}

function removeFileFromFileList(fileList, filename) {
  remove(fileList, item => item.filename === filename);
}

// Concurrent AJAX requests each load their own snapshot of the session at
// request start, so updates made by parallel requests can clobber each
// other when the session is saved. Serialise the read-modify-write per
// session so parallel uploads/deletes don't lose each other's changes.
const sessionLocks = new Map();

function lockSession(sessionID, fn) {
  const tail = sessionLocks.get(sessionID) || Promise.resolve();
  const result = tail.then(fn, fn);
  const guarded = result.catch(() => {});
  sessionLocks.set(sessionID, guarded);
  guarded.finally(() => {
    if (sessionLocks.get(sessionID) === guarded) {
      sessionLocks.delete(sessionID);
    }
  });
  return result;
}

function updateUploadedFiles(req, fieldName, updateFn) {
  return lockSession(req.sessionID, () => new Promise((resolve, reject) => {
    req.session.reload((err) => {
      if (err) {
        return reject(err);
      }
      const files = get(req.session, fieldName) || [];
      updateFn(files);
      set(req.session, fieldName, files);
      req.session.save((err) => err ? reject(err) : resolve(files));
    });
  }));
}

module.exports = { FileUpload, getUploadedFiles, removeFileFromFileList, updateUploadedFiles };

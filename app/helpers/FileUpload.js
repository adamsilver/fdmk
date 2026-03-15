const { formidable } = require('formidable');
const { get, set, remove } = require('lodash');

class FileUpload {
  constructor({ fieldName, allowedTypes, maxFileSize, uploadDir = '.tmp/uploads/', errors = {} }) {
    this.fieldName = fieldName;
    this.allowedTypes = allowedTypes;
    this.maxFileSize = maxFileSize;
    this.uploadDir = uploadDir;
    this.errors = errors;
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
    let fileTypeError = null;

    const form = formidable({
      uploadDir: this.uploadDir,
      filter: ({ originalFilename, mimetype }) => {
        if (!originalFilename) {
          return false;
        }
        if (!this.allowedTypes.includes(mimetype)) {
          fileTypeError = originalFilename;
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

        if (fileTypeError) {
          rejected.push({
            file: { originalname: fileTypeError },
            error: { code: 'FILE_TYPE', message: this.getErrorMessage('FILE_TYPE', fileTypeError) }
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

module.exports = { FileUpload, getUploadedFiles, removeFileFromFileList };

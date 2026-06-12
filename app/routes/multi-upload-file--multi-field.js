const { FileUpload, getUploadedFiles, removeFileFromFileList, updateUploadedFiles } = require('../helpers/FileUpload');

const upload = new FileUpload({
  fieldName: 'addReceiptsMultiField[documents]',
  allowedTypes: ['image/png', 'image/gif', 'image/jpeg', 'image/jpg'],
  maxFileSize: 1024 * 1024,
  errors: {
    FILE_TYPE:       (filename) => `${filename} must be a PNG, GIF or JPEG`,
    LIMIT_FILE_SIZE: (filename) => `${filename} must be smaller than 1MB`,
    NO_FILE:         () => 'Select a file'
  }
});

module.exports = router => {

  router.get('/demos/multi-file-upload--multi-fields', getUploadedFiles(upload.fieldName), function(req, res) {
    const pageObject = {
      uploadedFiles: req.uploadedFiles,
      errorMessage: null,
      errorSummary: { items: [] }
    };

    const rejectedFiles = JSON.parse(req.flash('uploadErrors')[0] || '[]');
    if (rejectedFiles.length) {
      const messages = rejectedFiles.map(item => item.error.message);
      if (messages.length === 1) {
        pageObject.errorMessage = { text: messages[0] };
      } else {
        pageObject.errorMessages = messages;
      }
      pageObject.errorSummary.items = messages.map(message => ({ text: message, href: '#documents' }));
    }

    res.render('demos/multi-file-upload--multi-fields/index.html', pageObject);
  });

  router.post('/demos/multi-file-upload--multi-fields', getUploadedFiles(upload.fieldName), async (req, res) => {
    const { uploaded, rejected, deleteFilename, aborted } = await upload.parse(req);
    if (aborted) return;

    req.uploadedFiles.push(...uploaded);
    req.flash('uploadErrors', JSON.stringify(rejected));

    if (deleteFilename) {
      removeFileFromFileList(req.uploadedFiles, deleteFilename);
    }

    res.redirect('/demos/multi-file-upload--multi-fields');
  });

  router.post('/demos/demo2-ajax-upload', async (req, res) => {
    const { uploaded, rejected, aborted } = await upload.parse(req);
    if (aborted) return;

    if (rejected.length) {
      return res.json({ error: rejected[0].error, file: rejected[0].file });
    }

    const file = uploaded[0];
    await updateUploadedFiles(req, upload.fieldName, files => files.push(file));

    res.json({
      file,
      success: {
        messageHtml: `<a href="${file.path}">${file.originalname}</a><span class="govuk-visually-hidden"> uploaded</span>`
      }
    });
  });

  router.post('/demos/demo2-ajax-delete', async (req, res) => {
    await updateUploadedFiles(req, upload.fieldName, files => removeFileFromFileList(files, req.body.delete));
    res.json({});
  });

};

const { FileUpload, getUploadedFiles, removeFileFromFileList } = require('../helpers/FileUpload');

const upload = new FileUpload({
  fieldName: 'addReceipts[documents]',
  allowedTypes: ['image/png', 'image/gif', 'image/jpeg', 'image/jpg'],
  maxFileSize: 1024 * 1024,
  errors: {
    FILE_TYPE:       (filename) => `${filename} must be a PNG, GIF or JPEG`,
    LIMIT_FILE_SIZE: (filename) => `${filename} must be smaller than 1mb`,
    NO_FILE:         () => 'Select a file'
  }
});

module.exports = router => {

  router.get('/demos/multi-file-upload--enhanced', getUploadedFiles(upload.fieldName), function(req, res) {
    const pageObject = {
      uploadedFiles: req.uploadedFiles,
      errorMessage: null,
      errorSummary: { items: [] }
    };

    const rejectedFiles = JSON.parse(req.flash('uploadErrors')[0] || '[]');
    if (rejectedFiles.length) {
      const messages = rejectedFiles.map(item => item.error.message);
      pageObject.errorMessage = { html: messages.join('<br>') };
      pageObject.errorSummary.items = messages.map(message => ({ text: message, href: '#documents' }));
    }

    res.render('demos/multi-file-upload--enhanced/index.html', pageObject);
  });

  router.post('/demos/multi-file-upload--enhanced', getUploadedFiles(upload.fieldName), async (req, res) => {
    const { uploaded, rejected, deleteFilename } = await upload.parse(req);

    req.uploadedFiles.push(...uploaded);
    req.flash('uploadErrors', JSON.stringify(rejected));

    if (deleteFilename) {
      removeFileFromFileList(req.uploadedFiles, deleteFilename);
    }

    res.redirect('/demos/multi-file-upload--enhanced');
  });

  router.post('/demos/enhanced-ajax-upload', getUploadedFiles(upload.fieldName), async (req, res) => {
    const { uploaded, rejected } = await upload.parse(req);

    if (rejected.length) {
      return res.json({ error: rejected[0].error, file: rejected[0].file });
    }

    const file = uploaded[0];
    req.uploadedFiles.push(file);

    res.json({
      file,
      success: {
        messageHtml: `<a href="${file.path}">${file.originalname}</a>`,
        messageText: `${file.originalname} added`
      }
    });
  });

  router.post('/demos/enhanced-ajax-delete', getUploadedFiles(upload.fieldName), function(req, res) {
    removeFileFromFileList(req.uploadedFiles, req.body.delete);
    res.json({});
  });

};

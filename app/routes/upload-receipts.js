const path = require('path')
const { set } = require('lodash')
const { FileUpload, getUploadedFiles, removeFileFromFileList } = require('../helpers/FileUpload')

const upload = new FileUpload({
  fieldName: 'uploadReceipts[receipt]',
  allowedTypes: ['image/png', 'image/gif', 'image/jpeg'],
  maxFileSize: 10 * 1024 * 1024,
  errors: {
    FILE_TYPE:       (filename) => `${filename} must be a PNG, GIF or JPG`,
    LIMIT_FILE_SIZE: (filename) => `${filename} must be smaller than 10MB`,
    NO_FILE:         () => 'Select a receipt'
  }
})

function uploadError(message) {
  return {
    errorSummary: { items: [{ text: message, href: '#uploadReceipts-receipt' }] },
    inlineErrors: { receipt: { text: message } },
    errorHighlights: {}
  }
}

module.exports = router => {

  router.get('/test-cases/upload-receipts', (req, res) => {
    res.render('test-cases/upload-receipts/index.html')
  })

  router.post('/test-cases/upload-receipts', getUploadedFiles(upload.fieldName), async (req, res) => {
    const { uploaded, rejected } = await upload.parse(req)

    const realRejections = rejected.filter(r => r.error.code !== 'NO_FILE')
    if (realRejections.length > 0) {
      req.flash('error', uploadError(realRejections[0].error.message))
      return res.redirect('/test-cases/upload-receipts')
    }

    if (uploaded.length === 0) {
      req.flash('error', uploadError('Select a receipt'))
      return res.redirect('/test-cases/upload-receipts')
    }

    req.uploadedFiles.push(...uploaded)
    return res.redirect('/test-cases/upload-receipts/list')
  })

  router.get('/test-cases/upload-receipts/list', getUploadedFiles(upload.fieldName), (req, res) => {
    res.render('test-cases/upload-receipts/list.html', { uploadedFiles: req.uploadedFiles })
  })

  router.post('/test-cases/upload-receipts/list', (req, res) => {
    const another = (req.session.data.uploadReceipts || {}).another
    if (another === 'yes') {
      return res.redirect('/test-cases/upload-receipts')
    }
    res.redirect('/test-cases/upload-receipts/check')
  })

  router.get('/test-cases/upload-receipts/delete/:filename', getUploadedFiles(upload.fieldName), (req, res) => {
    removeFileFromFileList(req.uploadedFiles, req.params.filename)
    if (req.uploadedFiles.length === 0) {
      return res.redirect('/test-cases/upload-receipts')
    }
    res.redirect('/test-cases/upload-receipts/list')
  })

  router.get('/test-cases/upload-receipts/file/:filename', (req, res) => {
    res.sendFile(path.join(process.cwd(), '.tmp/uploads', req.params.filename))
  })

  router.get('/test-cases/upload-receipts/check', getUploadedFiles(upload.fieldName), (req, res) => {
    res.render('test-cases/upload-receipts/check.html', { uploadedFiles: req.uploadedFiles })
  })

  router.post('/test-cases/upload-receipts/check', (req, res) => {
    set(req.session, upload.fieldName, [])
    req.session.data.uploadReceipts = {}
    res.redirect('/test-cases/upload-receipts')
  })

  router.get('/test-cases/upload-receipts--image', (req, res) => {
    res.render('test-cases/upload-receipts--image/index.html')
  })
  router.post('/test-cases/upload-receipts--image', (req, res) => {
    res.redirect('/test-cases/upload-receipts--image')
  })

  router.get('/test-cases/upload-receipts--doc', (req, res) => {
    res.render('test-cases/upload-receipts--doc/index.html')
  })
  router.post('/test-cases/upload-receipts--doc', (req, res) => {
    res.redirect('/test-cases/upload-receipts--doc')
  })

}

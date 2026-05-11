const path = require('path')
const { FileUpload, getUploadedFiles, removeFileFromFileList } = require('../helpers/FileUpload')

const upload = new FileUpload({
  fieldName: 'createProfile[photo]',
  allowedTypes: ['image/png', 'image/gif', 'image/jpeg', 'image/jpg'],
  maxFileSize: 10 * 1024 * 1024,
  errors: {
    FILE_TYPE:       (filename) => `${filename} must be a PNG, GIF or JPEG`,
    LIMIT_FILE_SIZE: (filename) => `${filename} must be smaller than 10MB`,
    NO_FILE:         () => 'Select a photo'
  }
})

function uploadError(message) {
  return {
    errorSummary: { items: [{ text: message, href: '#createProfile-photo' }] },
    inlineErrors: { photo: { text: message } },
    errorHighlights: {}
  }
}

module.exports = router => {

  // Step 1 — Name
  router.get('/demos/create-profile', (req, res) => {
    res.render('demos/create-profile/index.html')
  })
  router.post('/demos/create-profile', (req, res) => {
    res.redirect('/demos/create-profile/where')
  })

  // Step 2 — Where is your photo?
  router.get('/demos/create-profile/where', (req, res) => {
    res.render('demos/create-profile/where.html')
  })
  router.post('/demos/create-profile/where', (req, res) => {
    const photoWhere = (req.session.data.createProfile || {}).photoWhere
    res.redirect(photoWhere === 'device' ? '/demos/create-profile/upload' : '/demos/create-profile/how')
  })

  // Step 3a — How do you want to get the link?
  router.get('/demos/create-profile/how', (req, res) => {
    res.render('demos/create-profile/how.html')
  })
  router.post('/demos/create-profile/how', (req, res) => {
    const photoHow = (req.session.data.createProfile || {}).photoHow
    res.redirect(photoHow === 'qr' ? '/demos/create-profile/qr-code' : '/demos/create-profile/email')
  })

  // Step 3b — QR code
  router.get('/demos/create-profile/qr-code', (req, res) => {
    res.render('demos/create-profile/qr-code.html')
  })

  // Step 3c — Email address
  router.get('/demos/create-profile/email', (req, res) => {
    res.render('demos/create-profile/email.html')
  })
  router.post('/demos/create-profile/email', (req, res) => {
    res.redirect('/demos/create-profile/email-sent')
  })

  // Step 3d — Email sent
  router.get('/demos/create-profile/email-sent', (req, res) => {
    const email = (req.session.data.createProfile || {}).emailAddress || ''
    let obfuscatedEmail = email
    if (email.includes('@')) {
      const [local, domain] = email.split('@')
      obfuscatedEmail = local.charAt(0) + '•••@' + domain
    }
    res.render('demos/create-profile/email-sent.html', { obfuscatedEmail })
  })

  // Step 4 — Upload photo
  router.get('/demos/create-profile/upload', (req, res) => {
    res.render('demos/create-profile/upload.html')
  })

  router.post('/demos/create-profile/upload', getUploadedFiles(upload.fieldName), async (req, res) => {
    const { uploaded, rejected } = await upload.parse(req)

    const realRejections = rejected.filter(r => r.error.code !== 'NO_FILE')
    if (realRejections.length > 0) {
      req.flash('error', uploadError(realRejections[0].error.message))
      return res.redirect('/demos/create-profile/upload')
    }

    if (uploaded.length === 0) {
      req.flash('error', uploadError('Select a photo'))
      return res.redirect('/demos/create-profile/upload')
    }

    req.uploadedFiles.length = 0
    req.uploadedFiles.push(uploaded[0])
    return res.redirect('/demos/create-profile/good')
  })

  router.get('/demos/create-profile/file/:filename', (req, res) => {
    res.sendFile(path.join(process.cwd(), '.tmp/uploads', req.params.filename))
  })

  // Step 5 — Photo looks good
  router.get('/demos/create-profile/good', getUploadedFiles(upload.fieldName), (req, res) => {
    res.render('demos/create-profile/good.html', { uploadedFiles: req.uploadedFiles })
  })
  router.post('/demos/create-profile/good', (req, res) => {
    const photoWhere = (req.session.data.createProfile || {}).photoWhere
    const continueWhere = (req.session.data.createProfile || {}).continueWhere
    if (photoWhere === 'phone-tablet' && continueWhere === 'computer') {
      return res.redirect('/demos/create-profile/return-to-computer')
    }
    res.redirect('/demos/create-profile/check')
  })

  // Step 6 — Return to computer
  router.get('/demos/create-profile/return-to-computer', (req, res) => {
    res.render('demos/create-profile/return-to-computer.html')
  })

  // Step 7 — Check answers
  router.get('/demos/create-profile/check', getUploadedFiles(upload.fieldName), (req, res) => {
    res.render('demos/create-profile/check.html', { uploadedFiles: req.uploadedFiles })
  })
  router.post('/demos/create-profile/check', (req, res) => {
    req.session.data.createProfile = {}
    res.redirect('/demos/create-profile')
  })

}

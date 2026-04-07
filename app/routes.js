//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

const flash = require('connect-flash')
router.use(flash())

router.all('*', (req, res, next) => {
  res.locals.originalUrl = req.originalUrl
  res.locals.isLocal = process.env.NODE_ENV !== 'production'
  res.locals.flash = req.flash('success')
  let flashError = req.flash('error')
  if(flashError[0]) {
    res.locals.errorSummary = flashError[0].errorSummary
    res.locals.inlineErrors = flashError[0].inlineErrors
    res.locals.errorHighlights = flashError[0].errorHighlights
  }
  next()
})

router.get('/clear-all-data', (req, res) => {
  req.session.data = {}
  if(req.query.returnUrl) {
    res.redirect(req.query.returnUrl)
  } else {
    res.redirect('/')
  }
})


router.post('/test-cases/email-preferences-radios', (req, res) => {
  req.flash('success', 'Email settings saved')
  res.redirect(`/test-cases/email-preferences-radios`)
})

router.post('/test-cases/email-preferences-checkboxes', (req, res) => {
  req.flash('success', 'Email settings saved')
  res.redirect(`/test-cases/email-preferences-checkboxes`)
})

// Add your routes here
router.get('/demos/checkbox-filter', (req, res) => {
  let selectedItems = []

  if(req.session.data.subject && req.session.data.subject.length > 0) {
    selectedItems = req.session.data.subject.map(item => {
      return {
        href: '/whatever',
        text: item
      }
    })
  }

  res.render('demos/checkbox-filter', {
    selectedItems
  })
})

router.get('/contents', (req, res) => {
  res.redirect('/demos')
})

router.get('/other', (req, res) => {
  res.redirect('/test-cases')
})

router.get('/', (req, res) => {
  if(process.env.NODE_ENV !== 'production' || req.session.data.user) {
    res.redirect('/demos')
  } else {
    res.redirect('/account/sign-in')
  }
})


require('./routes/account')(router)
require('./routes/multi-upload-file')(router)
require('./routes/multi-upload-file--multi-field')(router)
require('./routes/form-validation')(router)
require('./routes/mfa')(router)
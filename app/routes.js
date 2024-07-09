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
  res.locals.flash = req.flash('success')
  let flashError = req.flash('error')
  if(flashError[0]) {
    res.locals.errorSummary = flashError[0].errorSummary
    res.locals.inlineErrors = flashError[0].inlineErrors
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


// Add your routes here
router.post('/email-preferences', (req, res) => {
  req.flash('success', 'Email settings saved')
  res.redirect(`/email-preferences`)
})

// Add your routes here
router.get('/checkbox-filter', (req, res) => {
  let selectedItems = []

  if(req.session.data.subject && req.session.data.subject.length > 0) {
    selectedItems = req.session.data.subject.map(item => {
      return {
        href: '/whatever',
        text: item
      }
    })
  }

  res.render('checkbox-filter', {
    selectedItems
  })
})

require('./routes/multi-upload-file')(router)
require('./routes/form-validation')(router)
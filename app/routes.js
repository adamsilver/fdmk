//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

const flash = require('connect-flash')
router.use(flash())

router.all('*', (req, res, next) => {
  res.locals.flash = req.flash('success')
  next()
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
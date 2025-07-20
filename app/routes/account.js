const Validator = require('../helpers/validator')
const rules = require('../helpers/rules')

module.exports = router => {

  router.post('/account/sign-in', (req, res) => {

    const validator = new Validator(req, res);

    validator.add({name: 'signIn.password', rules: [{
        fn:rules.notEmpty,
        message: 'Enter password'
      }, {
        fn: (value) => {
          let valid = true
          if(value != 'Boom1') {
            valid = false
          }
          return valid
        },
        message: 'Password is incorrect'
      }]
    })

    if(validator.validate()) {
      req.session.data.user = {}
      res.redirect('/contents')
    } else {
      req.flash('error', {
        errorSummary: validator.getErrorSummary(),
        inlineErrors: validator.getInlineErrors(),
        errorHighlights: validator.getErrorHighlights()
      })
      res.redirect('/account/sign-in')
    }

    // if(req.body.signIn.password == 'Boom1') {
    //   req.session.data.user = {}
    //   res.redirect('/contents')
    // } else {
    //   req.session.data.user = null
    //   res.redirect('/account/sign-in')
    // }
  })

  router.get('/account/sign-out', (req, res) => {
    delete req.session.data.signIn
    req.session.data.user = null
    res.redirect('/account/sign-in')
  })

  router.use((req, res, next) => {
    const allowedPaths = ['/account/sign-in', '/account/sign-out']
    const isAllowed = allowedPaths.includes(req.path) && ['GET', 'POST'].includes(req.method)

    if (req.session.data.user || isAllowed) {
      next()
    } else {
      res.redirect('/account/sign-in')
    }
  })

}
const Validator = require('../helpers/validator')
const rules = require('../helpers/rules')

module.exports = router => {

  router.get('/about-you', function( req, res ){
    res.render('about-you')
  })

  router.post('/about-you', function( req, res ){
    const validator = new Validator(req, res);

    validator.add({name: 'createJob.title', rules: [{
        fn:rules.empty,
        message: 'Enter job title'
      }]
    })

    validator.add({name: 'createJob.details', rules: [{
        fn:rules.notEmpty,
        message: 'Enter job details'
      }]
    })

    validator.add({name: 'createJob.pattern', rules: [{
        fn: rules.radioSelected,
        message: 'Select working pattern'
      }]
    })

    validator.add({name: 'createJob.benefits', rules: [{
        fn: rules.checkboxSelected,
        message: 'Select benefits'
      }]
    })

    if(validator.validate()) {
      res.redirect('/yay')
    } else {
      req.flash('error', {
        errorSummary: validator.getErrorSummary(),
        inlineErrors: validator.getInlineErrors()
      })
      res.redirect('/about-you')
    }

  });

}

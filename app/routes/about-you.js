const Validator = require('../helpers/validator')
const rules = require('../helpers/rules')

module.exports = router => {

  router.get('/about-you', function( req, res ){
    res.render('about-you')
  })

  router.post('/about-you', function( req, res ){
    const validator = new Validator(req, res);

    validator.add({name: 'createJob.title', rules: [{
        fn:rules.notEmpty,
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

    validator.add({name: 'createJob.startDate.day', rules: [{
      fn: rules.notEmptyDate,
      params: {
        day: req.body.createJob.startDate.day,
        month: req.body.createJob.startDate.month,
        year: req.body.createJob.startDate.year,
      },
      message: 'Enter job start date'
    }, {
        fn: rules.notEmpty,
        message: 'Job start date must include a day'
      }, {
        fn: rules.notEmptyMonth,
        params: {
          month: req.body.createJob.startDate.month,
          fieldName: 'createJob.startDate.month'
        },
        message: 'Job start date must include a month'
      }, {
        fn: rules.notEmptyYear,
        params: {
          year: req.body.createJob.startDate.year,
          fieldName: 'createJob.startDate.year'
        },
        message: 'Job start date must include a year'
      }]
    })

    validator.add({name: 'createJob.location', rules: [{
        fn: rules.notEmpty,
        message: 'Select location'
      }]
    })

    validator.add({name: 'createJob.specification', rules: [{
      fn: rules.notEmpty,
      message: 'Select job specification'
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

const Validator = require('../helpers/validator')
const rules = require('../helpers/rules')

module.exports = router => {

  router.get('/form-validation', function( req, res ){
    res.render('form-validation')
  })

  router.post('/form-validation', function( req, res ){
    const validator = new Validator(req, res);

    validator.add({name: 'createJob.title', rules: [{
        fn:rules.notEmpty,
        message: 'Enter job title'
      }]
    })

    validator.add({name: 'createJob.description', rules: [{
        fn:rules.notEmpty,
        message: 'Enter job description'
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

    validator.add({
      name: 'createJob.startDate.day',
      rules: [
        {
          fn: rules.notEmptyDate,
          params: {
            boom: 1,
            day: req.body.createJob.startDate.day,
            month: req.body.createJob.startDate.month,
            year: req.body.createJob.startDate.year,
          },
          message: 'Enter job start date'
        }, {
          fn: rules.notEmptyDay,
          params: {
            boom: 2,
            day: req.body.createJob.startDate.day,
            fieldName: 'createJob.startDate.day'
          },
          message: 'Job start date must include a day'
        }, {
          fn: rules.notEmptyMonth,
          params: {
            boom: 3,
            month: req.body.createJob.startDate.month,
            fieldName: 'createJob.startDate.month'
          },
          message: 'Job start date must include a month'
        }, {
          fn: rules.notEmptyYear,
          params: {
            boom: 4,
            year: req.body.createJob.startDate.year,
            fieldName: 'createJob.startDate.year'
          },
          message: 'Job start date must include a year'
        }
      ]
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
        inlineErrors: validator.getInlineErrors(),
        errorHighlights: validator.getErrorHighlights()
      })
      res.redirect('/form-validation')
    }

  });

}

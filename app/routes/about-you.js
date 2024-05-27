const Validator = require('../helpers/validator')

module.exports = router => {

  router.get('/about-you', function( req, res ){
    res.render('about-you')
  })

  router.post('/about-you', function( req, res ){
    const validator = new Validator(req, res);

    validator.add({
      name: 'createJob.details',
      rules: [{
        fn: (value) => {
          let valid = true;
          if(!value || value.trim().length == 0) {
            valid = false;
          }
          return valid;
        },
        message: 'Enter details'
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

module.exports = router => {

  router.post('/test-cases/mfa/new', function( req, res ){
    if(req.session.data.mfa.hasMultifactor == 'Yes') {
      res.redirect('/test-cases/mfa/new/methods')
    } else {
      res.redirect('/test-cases/mfa/new/check')
    }
  });

  router.post('/test-cases/mfa/new/methods', function( req, res ){
    if(req.session.data.mfa.sms == 'On' || req.session.data.mfa.authenticator == 'On') {
      res.redirect('/test-cases/mfa/new/backup')
    } else {
      res.redirect('/test-cases/mfa/new/check')
    }
  });

  router.post('/test-cases/mfa/new/backup', function( req, res ){
    res.redirect('/test-cases/mfa/new/check')
  });

  router.post('/test-cases/mfa/new/check', function( req, res ){
    res.redirect('/test-cases/mfa')
  });

}

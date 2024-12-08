module.exports = router => {

  router.post('/mfa/new', function( req, res ){
    if(req.session.data.mfa.hasMultifactor == 'Yes') {
      res.redirect('/mfa/new/methods')
    } else {
      res.redirect('/mfa/new/check')
    }
  });

  router.post('/mfa/new/methods', function( req, res ){
    if(req.session.data.mfa.sms == 'On' || req.session.data.mfa.authenticator == 'On') {
      res.redirect('/mfa/new/backup')
    } else {
      res.redirect('/mfa/new/check')
    }
  });

  router.post('/mfa/new/backup', function( req, res ){
    res.redirect('/mfa/new/check')
  });

  router.post('/mfa/new/check', function( req, res ){
    res.redirect('/mfa')
  });

}

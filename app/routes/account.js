module.exports = router => {

  router.post('/account/sign-in', (req, res) => {
    if(req.body.signIn.password == 'Boom1') {
      req.session.data.user = {}
      res.redirect('/contents')
    } else {
      req.session.data.user = null
      res.redirect('/account/sign-in')
    }
  })

  router.get('/account/sign-out', (req, res) => {
    req.session.data.user = null
    res.redirect('/account/sign-in')
  })

}
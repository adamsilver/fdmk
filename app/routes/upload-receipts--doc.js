module.exports = router => {

  router.get('/test-cases/upload-receipts--doc', (req, res) => {
    res.render('test-cases/upload-receipts--doc/index.html')
  })

  router.post('/test-cases/upload-receipts--doc', (req, res) => {
    res.redirect('/test-cases/upload-receipts--doc')
  })

}

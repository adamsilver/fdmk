module.exports = router => {

  router.get('/test-cases/upload-receipts--image', (req, res) => {
    res.render('test-cases/upload-receipts--image/index.html')
  })

  router.post('/test-cases/upload-receipts--image', (req, res) => {
    res.redirect('/test-cases/upload-receipts--image')
  })

}

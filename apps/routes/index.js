var express = require('express');
var router = express.Router();
const cUsers = require('../controllers/users')
const checking = require('../middleware')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', cUsers.create)
router.post('/user/login', cUsers.login)
router.post('/user/reset-password', cUsers.forget)
router.get('/user/verify/:username/:token', cUsers.verifyEmail)
router.get('/user/reset/:username/:email', cUsers.verifyForget)
router.put('/user/update-password', cUsers.resetPassword)

module.exports = router;

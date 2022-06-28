var express = require('express');
var router = express.Router();
const cUsers = require('../controllers/users')
const checking = require('../middleware')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/user/create', cUsers.create)
router.get('/user/list', cUsers.findAll)
router.post('/user/login', cUsers.login)
router.get('/user/verify/:username/:token', checking.checkSession ,cUsers.verifyEmail)

module.exports = router;

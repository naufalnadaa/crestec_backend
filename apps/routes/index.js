var express = require('express');
var router = express.Router();
const cUsers = require('../controllers/users')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', cUsers.create)
router.get('/user/verify/:username/:token', cUsers.verifyEmail)

module.exports = router;

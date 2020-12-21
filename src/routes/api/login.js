const { Router, json, urlencoded } = require('express');
const router = Router();

const bcrypt = require('bcrypt');

router.use(json());
router.use(urlencoded({ extended: true }));

router.post('/api/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    const userData = await req.app.server.models.UserModel.findOne({ 'authentication.username': username });
    if (userData) {
      bcrypt.compare(password, userData.authentication.password).then(e => {
        if (e) {
          req.app.server.logger.log('Authenticated', userData.authentication.username);
          req.session.userData = userData;
          res.redirect(req.query.r ? req.query.r : '/');
          return;
        } else {
          req.app.server.logger.warn('Failed authentication for', userData.authentication.username);
          res.redirect('/login?error=Incorrect username or password.');
          return;
        }
      });
    } else res.redirect('/login?error=Incorrect username or password.');
  } else res.redirect('/login?error=Username and Password are required.');
  return;
});

module.exports = router;
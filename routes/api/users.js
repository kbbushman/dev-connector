const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

// Load User model
const user = require('../../models/User');

// @route GET api/users/test
// @desc Tests users route
// @access Public
router.get('/test', (req, res) => res.json({msg: 'Users route works'}));

// @route GET api/users/register
// @desc Registers users
// @access Public
router.post('/register', (req, res) => {
  // Check email for current registration
  User.findOne({ email: req.body.email })
  .then(user => {
    // If user exists, respond with 400 status and error message
    if(user) {
      return res.status(400).json({email: 'Email already exists.'})
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: '200', // Size
        r: 'pg', // Rating
        d: 'mm', // Default if no avatar provided
      });

      // Create newUser
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password,
      });

      // Generate Bcrypt Salt
      bcrypt.genSalt(10, (err, salt) => {
        // Hash newUser Password
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if(err) throw err;
          newUser.password = hash;
          // Save newUser, respond with user
          newUser.save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        })
      })
    }
  })
});

module.exports = router;

const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// Load User Registration & Login Form Validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Load User model
const user = require('../../models/User');

// @route GET api/users/test
// @desc Tests users route
// @access Public
router.get('/test', (req, res) => res.json({msg: 'Users route works'}));

// @route POST api/users/register
// @desc Registers users
// @access Public
router.post('/register', (req, res) => {
  // Validate Register Input
  const { errors, isValid } = validateRegisterInput(req.body);

  if(!isValid) {
    return res.status(400).json(errors);
  }

  // Check email for current registration
  User.findOne({ email: req.body.email })
  .then(user => {
    // If user exists, respond with 400 status and error message
    if(user) {
      errors.email = 'Email already exists.'
      return res.status(400).json(errors);
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

// @route POST api/users/login
// @desc Login users / Return JWT Token
// @access Public
router.post('/login', (req, res) => {
  // Validate Register Input
  const { errors, isValid } = validateLoginInput(req.body);

  if(!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Find User by email
  User.findOne({email})
    .then(user => {
      // Check for user
      if(!user) {
        errors.email = 'User not found.'
        return res.status(404).json(errors);
      }

      // Check password match
      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if(isMatch) {
            // Create payload and sign JWT Token if passwords match (expiration is in seconds)
            const payload = { id: user.id, name: user.name, avatar: user.avatar }

            jwt.sign(payload, keys.secretOrKey, { expiresIn: 7200 }, (err, token) => {
              res.json({ success: true, token: 'Bearer ' + token })
            }); 
            
          } else {
            // Return 400 status and error message if passwords don't match
            errors.password = 'Email or password is incorrect.'
            return res.status(400).json(errors);
          }
        })
    })
})

// @route POST api/users/current
// @desc Returns current user
// @access Private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  // // Respond with logged in user
  // res.json(req.user);
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
  })
});

module.exports = router;

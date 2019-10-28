// set up all users routes

const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
// import user model to create new users. A Model is an interface for creating, querying, updating, deleting records, etc.
const User = require('../../models/User');
const keys = require('../../config/keys');
const jwt = require('jsonwebtoken');
const validateLoginInput = require('../../validation/login');
const validateRegisterInput = require('../../validation/register');
const passport = require('passport');


// setting up a test route. the callback must take a request and response parameter.
router.get("/test", (req, res) => 
  res.json({ msg: "This is the users route" })
  );

// setting up a route to register new users 
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }
  
  User.findOne({ handle: req.body.handle }).then(user => {
    if (user) {
      errors.handle = "User already exists";
      return res.status(400).json(errors);
    } else {
      const newUser = new User({
        handle: req.body.handle,
        email: req.body.email,
        password: req.body.password
      });

      // store pw in a salted and encrypted password hash w/ user
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => {
              // set up the paylod for web token signing that's returned to user when signed/logged in
              const payload = { id: user.id, handle: user.handle };

              jwt.sign(
                payload, 
                keys.secretOrKey, 
                // tells key to expire in 1 hr
                { expiresIn: 3600 }, 
                (err, token) => {
                res.json({
                  success: true,
                  token: "Bearer " + token
                });
              });
            })
            .catch(err => console.log(err));
        });
      });
    }
  });
});


// LOGIN ROUTE
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const handle = req.body.handle;
  const password = req.body.password;

  User.findOne({ handle }).then(user => {
    if (!user) {
      errors.handle = "This user does not exist";
      return res.status(400).json(errors);
    }

    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        const payload = { id: user.id, handle: user.handle };

        jwt.sign(
          payload, 
          keys.secretOrKey, 
          { expiresIn: 3600 }, 
          (err, token) => {
          res.json({
            success: true,
            token: "Bearer " + token
          });
        });
      } else {
        errors.password = "Incorrect password";
        return res.status(400).json(errors);
      }
    });
  });
});

// Private auth route, require auth token to be sent w/ request before accessible
router.get('/current', passport.authenticate('jwt', {session: false}), (req, res) => {
  res.json({
    id: req.user.id,
    handle: req.user.handle,
    email: req.user.email
  })
})

module.exports = router;
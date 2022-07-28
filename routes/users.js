const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Users = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');
const router = express.Router();
const cors = require('./cors');
router.use(bodyParser.json());

/* GET users listing. */
router.get(
  '/',
  cors.corsWithOptions,
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  (req, res, next) => {
    Users.find({})
      .then(
        (users) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(users);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  }
);

router.post('/signup', cors.corsWithOptions, (req, res, next) => {
  Users.register(
    new Users({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        err.status = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({
          err: err,
        });
      } else {
        if (req.body.firstname) user.firstname = req.body.firstname;
        if (req.body.lastname) user.lastname = req.body.lastname;

        user.save((err, user) => {
          if (err) {
            err.status = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({
              err: err,
            });
            return;
          }

          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({
              success: true,
              status: 'Registration Successful!',
            });
          });
        });
      }
    }
  );
});

router.post(
  '/login',
  cors.corsWithOptions,
  passport.authenticate('local'),
  (req, res) => {
    var token = authenticate.getToken({
      _id: req.user._id,
      isAdmin: req.user.admin,
    });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
      success: true,
      token: token,
      status: "You're successfully logged in.",
    });
  }
);

router.get('/logout', cors.corsWithOptions, (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    const err = new Error("You're not logged in.");
    err.status = 403;
    return next(err);
  }
});

module.exports = router;

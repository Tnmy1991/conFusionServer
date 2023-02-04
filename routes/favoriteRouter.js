const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Favorites = require('../models/favorites');
const favoriteRouter = express.Router();
const authenticate = require('../authenticate');
const cors = require('./cors');

favoriteRouter.use(bodyParser.json());
favoriteRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({
      user: req.user._id,
    })
      .populate(['user', 'dish'])
      .then(
        (favorites) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorites);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res, next) => {
      if (req.body?.dishes.length > 0) {
        let dishAdded = [];
        req.body.dishes.forEach((dish) => {
          Favorites.findOne({
            user: req.user._id,
            dish: dish._id,
          })
            .then(
              (result) => {
                if (result === null) {
                  Favorites.create({
                    user: req.user._id,
                    dish: dish._id,
                  }).then(
                    (favorite) => {
                      console.log('Dish added');
                      dishAdded.push(`Dish ${dish._id} added.`);
                      if (
                        req.body.dishes.length === dishAdded.length
                      ) {
                        res.statusCode = 200;
                        res.setHeader(
                          'Content-Type',
                          'application/json'
                        );
                        res.json(dishAdded);
                      }
                    },
                    (err) => next(err)
                  );
                } else {
                  dishAdded.push(`Dish ${dish._id} already exist.`);
                  if (req.body.dishes.length === dishAdded.length) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dishAdded);
                  }
                }
              },
              (err) => next(err)
            )
            .catch((err) => next(err));
        });
      } else {
        res.statusCode = 200;
        res.end(`No dish supplied to add into favorite!`);
      }
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res, next) => {
      res.statusCode = 403;
      res.end(`PUT operation not supported on /favorites`);
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res, next) => {
      Favorites.remove({
        user: req.user._id,
      })
        .then(
          (response) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );

favoriteRouter
  .route('/:dishId')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({
      user: req.user._id,
      dish: req.params.dishId,
    })
      .populate(['user', 'dish'])
      .then(
        (favorite) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res, next) => {
      Favorites.findOne({
        user: req.user._id,
        dish: req.params.dishId,
      })
        .then(
          (result) => {
            if (result === null) {
              Favorites.create({
                user: req.user._id,
                dish: req.params.dishId,
              }).then(
                (favorite) => {
                  console.log('Dish added');
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json([`Dish ${req.params.dishId} added.`]);
                },
                (err) => next(err)
              );
            } else {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json([`Dish ${req.params.dishId} already exist.`]);
            }
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res, next) => {
      res.statusCode = 403;
      res.end(`PUT operation not supported on /favorites`);
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res, next) => {
      Favorites.findOneAndRemove({
        dish: req.params.dishId,
      })
        .then(
          (response) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );

module.exports = favoriteRouter;

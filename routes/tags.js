'use strict';

const express = require('express');
const mongoose = require('mongoose');

const Tag = require('../models/tag')

const router = express.Router();

//GET Request ALL or searchTerm
router.get('/', (req, res, next) => {
    const { searchTerm } = req.query;
    let filter = {};

    if(searchTerm){
        filter.name = { $regex: searchTerm, $options: 'i'};
    }
    
    Tag.find(filter)
      .sort({updatedAt: 'desc'})
      .then((results) => {
          res.json(results);
      })
      .catch((err) => {
          next(err);
      });
});

//GET one tag by id
router.get('/:id', (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        const err = new Error('The `id` is not valid');
        err.status = 400;
        return next(err);
    }

    Tag.findById(id)
      .then((results) => {
          res.json(results);
      })
      .catch((err) => {
          next(err);
      });
});


module.exports = router;
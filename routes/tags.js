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


module.exports = router;
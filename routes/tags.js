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
          if(results === null){
              next();
          } else {
          res.json(results);
          }
      })
      .catch((err) => {
          next(err);
      });
});

//POST tag for creation
router.post('/', (req, res, next) => {
    const { name } = req.body;

    if(!name){
        const err = new Error(`Missing 'name' in request body`);
        return next(err);
    }

    const newTag = { name };

    Tag.create(newTag)
      .then((result) => {
          res.location(`${req.originalUrl}/${result.id}`)
          .status(201)
          .json(result);
      })
      .catch(err => {
          if(err.code === 11000) {
              err = new Error('The tag name already exists');
              err.status = 400;
          }
          next(err);
      });
});

//PUT tag for updating by id
router.put('/:id', (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)) {
        const err = new Error(`${id} is not a valid id`);
        err.status = 400;
        return next(err);
    }

    if(!name){
        const err = new Error(`Missing 'name' in request body`);
        err.status = 400;
        return next(err);
    }

    const updatedTag = { name };

    Tag.findByIdAndUpdate(id, updatedTag, {new: true})
      .then(result => {
          if(result === null){
            next(); 
          }else if(result){
              res.json(result);
          } else {
              next();
          }
      })
      .catch(err => {
          if(err.code === 11000) {
              err = new Error('The tag name already exists');
              err.status = 400;
          }
          next(err);
      });
});

//Delete a tag
router.delete('/:id', (req, res, next) => {
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        const err = new Error(`${id} is not a valid id`);
        err.status = 400;
        return next(err);
    }

    Tag.findByIdAndRemove(id)
      .then((result) => {
          if(result === null){
            next();
          } else {
          res.status(204).end();
          }
      })
      .catch(err => {
          next(err);
      });
});



module.exports = router;
'use strict';

const express = require('express');
const mongoose = require('mongoose');

const Folder = require('../models/folder');

const router = express.Router();

//Get all folders, filter by searchTerm (all items)
router.get('/', (req, res, next) => {
  const { searchTerm } = req.query;
  let filter = {};
  
  if(searchTerm){
      filter.name = { $regex: searchTerm, $options: 'i'};
  }

  Folder.find(filter)
    .sort({name: 'desc'})
    .then(results => {
        res.json(results);
    })
    .catch((err) => {
        next(err);
    })
});

//Get folders by id (single item)

router.get('/:id', (req, res, next) => {
  const { id } = req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
      const err = new Error(`${ id } is not a valid id`);
      err.status = 400;
      return next(err);
  }

  Folder.findById(id)
    .then(result => {
    if (result){
      res.json(result);
    } else {
        next();
    }
    })
    .catch(err => {
        next(err);
    });
});

//Post (create) a folder
router.post('/', (req, res, next) => {
    const { name } = req.body;
    
    if(!name){
        const err = new Error(`Missing 'name' in request body`);
        err.status = 400;
        return next(err);
    }

    const newFolder = { name };
    
    Folder.create(newFolder)
      .then(result => {
          res.location(`${req.originalUrl}/${result.id}`)
          .status(201)
          .json(result);
      })
      .catch(err => {
        if (err.code === 11000) {
            err = new Error('The folder name already exists');
            err.status = 400;
          }
        next(err);
      });
});

//Put (update) a folder
router.put('/:id', (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)) {
        const err = new Error(`${id} is not a valid id`);
        err.status = 400;
        return next(err);
    }
   
    if(!name) {
        const err = new Error(`Missing name in request body`);
        err.status = 400;
        return next(err);
    }

    const updateFolder = { name };

    Folder.findByIdAndUpdate(id, updateFolder, {new: true})
      .then(result => {
          if(result){
              res.json(result);
          } else {
            next();
          }
      })
      .catch(err => {
        if (err.code === 11000) {
            err = new Error('The folder name already exists');
            err.status = 400;
        }
        next(err);
      })
})

//Delete a folder
router.delete('/:id', (req, res, next)=> {
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        const err = new Error(`${id} is not a valid id`);
        err.status = 400;
        return next(err);
    }

    Folder.findByIdAndRemove(id)
      .then(() => {
          res.status(204).end();
      })
      .catch(err => {
          next(err);
      });
});


module.exports = router;
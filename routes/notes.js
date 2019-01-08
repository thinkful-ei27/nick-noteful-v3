'use strict';

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { MONGODB_URI } = require('../config');
const Note = require('../models/note')
/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const searchTerm = req.query.searchTerm;
  let filter = {};
  // console.log(`${searchTerm} is the searchTerm`);
  // console.log(`${req.query.searchTerm} is the req.searchTerm`);

  mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => {
      
      if(searchTerm) {
          filter.title = { $regex: searchTerm, $options: 'i' };
      }

      return Note.find(filter).sort({ updatedAt: 'desc' });
  })
  .then(results => {
      res.json(results);
  })
  .then(() => {
      return mongoose.disconnect()
  })
  .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
  });

});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const searchId = req.params.id;
  mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
      return Note.findById(searchId);
  })
  .then(results => {
      if(results !== null){
      res.json(results);
      } else {
        const err = new Error(`${searchId} not found`)
        next(err);
      }
  })
  .then(() => {
      return mongoose.disconnect()
  })
  .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
  });

  // console.log('Get a Note');
  // res.json({ id: 1, title: 'Temp 1' });

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {

  

  // console.log('Create a Note');
  // res.location('path/to/new/document').status(201).json({ id: 2, title: 'Temp 2' });

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {

  console.log('Update a Note');
  res.json({ id: 1, title: 'Updated Temp 1' });

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {

  console.log('Delete a Note');
  res.sendStatus(204);
});

module.exports = router;

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

      
  if(searchTerm) {
      filter.title = { $regex: searchTerm, $options: 'i' };
  }
  Note.find(filter)
  .sort({date: -1})
  .then((results) => {
    res.json(results);
  })
  .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
  });

});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const searchId = req.params.id;
  Note.findById(searchId)
  .then(results => {
      if(results !== null){
      res.json(results);
      } else {
        res.json({error: `${searchId} not found`, status: 400});
      }
  })
  .catch(err => {
      console.error(err);
      res.json(err);
  });

  // console.log('Get a Note');
  // res.json({ id: 1, title: 'Temp 1' });

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const newObject = {};
  console.log(req.body.title);
  console.log(req.body.content);
  if(req.body.title){
    newObject.title = req.body.title; 
  }
  if(req.body.content){
    newObject.content = req.body.content;
  }
  Note.create(newObject)
  .then((results) => {
    res.json(results);
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

  
//     mongoose.connect(MONGODB_URI, { useNewUrlParser: true})
//       .then(() => {
//         const newObject = new Note({
//             title: "Life is Pain",
//             content: "A Buddhist Journey by Nick"
//         });
//         const newObject2 = new Note({
//             title: "I have no content"
//         });
//           return Note.create(newObject);
//       })
//       .then(results => {
//           console.log(results);
//       })
//       .then(() => {
//           return mongoose.disconnect()
//       })
//       .catch(err => {
//           console.error(`ERROR: ${err.message}`);
//           console.error(err);
//       });
  // console.log('Create a Note');
  // res.location('path/to/new/document').status(201).json({ id: 2, title: 'Temp 2' });

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {

const updateId = req.params.id;
const {title, content} = req.body;
const updatedObject = {title, content};

Note.findByIdAndUpdate(updateId, updatedObject, {upsert: true, new: true})
  .then((results) => {
    res.json(results);
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

  //       mongoose.connect(MONGODB_URI, { useNewUrlParser: true})
//         .then(() => {
//             const updatedObject = {
//                 title: "PizzaPizza",
//                 content: "A Story of Caesar"
//             };
//             const updatedId = '111111111111111111111105';
//             return Note.findByIdAndUpdate(updatedId, updatedObject, {upsert: true, new: true})})
//         .then((results) => {
//             console.log(results);
//         })
//         .then(()=>{
//             return mongoose.disconnect();
//         })
//         .catch(err => {
//             console.error(`ERROR: ${err.message}`);
//             console.error(err);
//         });


  // console.log('Update a Note');
  // res.json({ id: 1, title: 'Updated Temp 1' });

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const deleteId = req.params.id;
  Note.findByIdAndDelete(deleteId)
    .then((results => {
      res.sendStatus(204);
    }))
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    })

  //     mongoose.connect(MONGODB_URI, { useNewUrlParser: true})
//       .then(() => {
//           const deleteId = '111111111111111111111105';
//           return Note.findByIdAndRemove(deleteId)
//       })
//       .then((results) => {
//           console.log(results);
//       })
//       .then(()=> {
//           return mongoose.disconnect();
//       })
//       .catch(err => {
//           console.error(`ERROR: ${err.message}`);
//           console.error(err);
//       });


  // console.log('Delete a Note');
  // res.sendStatus(204);
});

module.exports = router;

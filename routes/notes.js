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
  .sort({updatedAt: 'desc'})
  .then((results) => {
    res.json(results);
  })
  .catch(err => {
      next(err);
  });

});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  
  if(!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error(`${id} is not a valid id`);
    err.status = 400;
    return next(err);
  }

  Note.findById(id)
  .then(results => {
      if(results) {
        res.json(results);
      } else {
        next();
      }
    })
  .catch(err => {
    next(err);
  });
  // console.log('Get a Note');
  // res.json({ id: 1, title: 'Temp 1' });

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const { title, content } = req.body;
  // console.log(req.body.title);
  // console.log(req.body.content);
  // if(req.body.title){
  //   newObject.title = req.body.title; 
  // }
  // if(req.body.content){
  //   newObject.content = req.body.content;
  // }

  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  const newObject = { title, content };

  Note.create(newObject)
  .then((results) => {
    res.location(`${req.originalUrl}/${results.id}`)
      .status(201)
      .json(results);
  })
  .catch(err => {
    next(err);
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

if(!mongoose.Types.ObjectId.isValid(updateId)) {
  const err = new Error(`${updateId} is not a valid id`);
  err.status = 400;
  return next(err);
}

if(!title) {
  const err = new Error('Missing `title` in the request body');
  err.status = 400;
  return next(err);
}

Note.findByIdAndUpdate(updateId, updatedObject, {upsert: true, new: true})
  .then((results) => {
    if(results) {
      res.json(results);
    } else {
      next();
    }
  })
  .catch(err => {
    next(err);
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

  if(!mongoose.Types.ObjectId.isValid(deleteId)) {
    const err = new Error(`${deleteId} is not a valid id`);
    err.status = 400;
    return next(err);
  }

  Note.findByIdAndDelete(deleteId)
    .then((results => {
      res.sendStatus(204).end();
    }))
    .catch(err => {
      next(err);
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

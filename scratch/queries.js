const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => {
      const searchTerm = 'lady gaga';
      let filter = {};

      if(searchTerm) {
          filter.title = { $regex: searchTerm, $options: 'i' };
      }

      return Note.find(filter).sort({ updatedAt: 'desc' });
  })
  .then(results => {
      console.log(results);
  })
  .then(() => {
      return mongoose.disconnect()
  })
  .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
  });

  mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
    .then(() => {
        const searchId = '111111111111111111111105';
        return Note.findById(searchId);
    })
    .then(results => {
        console.log(results);
    })
    .then(() => {
        return mongoose.disconnect()
    })
    .catch(err => {
        console.error(`ERROR: ${err.message}`);
        console.error(err);
    });

    mongoose.connect(MONGODB_URI, { useNewUrlParser: true})
      .then(() => {
        const newObject = new Note({
            title: "Life is Pain",
            content: "A Buddhist Journey by Nick"
        });
        const newObject2 = new Note({
            title: "I have no content"
        });
          return Note.create(newObject);
      })
      .then(results => {
          console.log(results);
      })
      .then(() => {
          return mongoose.disconnect()
      })
      .catch(err => {
          console.error(`ERROR: ${err.message}`);
          console.error(err);
      });
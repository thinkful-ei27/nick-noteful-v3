'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');
const Note = require('../models/note');
const Folder = require('../models/folder');

const { folders, notes } = require('../db/data');

mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => {
    console.info('Dropping Database');
    return mongoose.connection.db.dropDatabase();
  })
  .then(() => {
    console.info('Seeding Database');
    return Promise.all([
      Note.insertMany(notes),
      Folder.insertMany(folders),
      Folder.createIndexes(),
    ]);
  })
  .then(() => {
    console.info('Disconnecting');
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

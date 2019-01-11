'use strict';

const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true}},
    { timestamps: true}
);

tagSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, result) => {
      delete result._id;
  }
});

module.exports = mongoose.model('Tag', tagSchema);
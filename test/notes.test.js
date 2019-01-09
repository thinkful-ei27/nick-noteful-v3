'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');
const Note = require('../models/note');
const { notes } = require('../db/data');
const expect = chai.expect;
chai.use(chaiHttp);

console.log(TEST_MONGODB_URI);

describe('Basic Tests for Notes Database', function(){
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  console.log(TEST_MONGODB_URI);
  beforeEach(function () {
    return Note.insertMany(notes);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return mongoose.disconnect();
  });
//   console.log(TEST_MONGODB_URI);
//   console.log(notes);
  describe('GET /api/notes', function() {
    it('Should return all the notes within the database when requested', function (){
      let res; //can be accessed at multiple lower levels
      return chai.request(app)
        .get('/api/notes')
        .then(function(_res){
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body[0]).to.be.an('object');
          expect(res.body.length).to.be.greaterThan(0);
          expect(res.body.length).to.equal(8);
        });  
    });
    it('Should return a single id when a specific valid id is requested', function(){
      let res; //can be accessed at multiple lower levels
      //Can we randomize this by using a findone?
      let searchId = "111111111111111111111108";
      let resultTitle = '10 ways marketers are making you addicted to dogs';
      return chai.request(app)
        .get(`/api/notes/${searchId}`)
        .then(function(_res){
          res = _res;
          console.log(res);
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.id).to.equal(searchId);
          expect(res.body.title).to.equal(resultTitle);
        })
    })
    it('Should return an error when a non-valid id is requested', function(){
      let res;
      let searchId = Math.random() *50000 ;
      return chai.request(app)
        .get(`/api/notes/${searchId}`)
          .then(function(_res){
            res = _res;
            console.log(res);
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res.body.message).to.equal(`${searchId} is not a valid id`);
          })
    })
  });
});
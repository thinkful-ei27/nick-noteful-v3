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


describe('Basic Tests for Notes Database', function(){
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Note.insertMany(notes);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return mongoose.disconnect();
  });

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
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.id).to.equal(searchId);
          expect(res.body.title).to.equal(resultTitle);
        })
    })
    it('Should return an error when a non-valid id is requested', function(){
      let res;
      let searchId = Math.random() * 50000 ;
      return chai.request(app)
        .get(`/api/notes/${searchId}`)
          .then(function(_res){
            res = _res;
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res.body.message).to.equal(`${searchId} is not a valid id`);
          })
    })
  });
  describe('POST /api/notes', function(){
    it('Should create and return a new item when provided correct data', function(){
      const newItem = {
        title: "How I Learned To Stop Worrying",
        content: "And Love Comrade Ducky-san"
      };
      let res;
      return chai.request(app)
        .post(`/api/notes`)
        .send(newItem)
        .then((_res) => {
          res = _res;
          expect(res).to.be.json;
          expect(res).to.have.status(201);
          expect(res.body).to.be.an('object');
          expect(res.body.title).to.equal(newItem.title);
          expect(res.body.content).to.equal(newItem.content);
          return Note.findById(res.body.id);
        })
        .then(foundData => {
          expect(res.body.title).to.equal(foundData.title);
          expect(res.body.id).to.equal(foundData.id);
          expect(res.body.content).to.equal(foundData.content);
          expect(String(new Date(res.body.createdAt))).to.equal(String(foundData.createdAt));
          expect(String(new Date(res.body.updatedAt))).to.equal(String(foundData.updatedAt));
        })
    })
    it('Should return an error if new item lacks title', function(){
      const newItem = {
        content: "Oh, no! I'm lacking a title"
      };
      let res;
      return chai.request(app)
        .post(`/api/notes`)
        .send(newItem)
        .then((_res) => {
          res = _res;
          expect(res).to.be.json;
          expect(res).to.have.status(400);
          expect(res.body).to.be.an('object');
          expect(res.body.message).to.equal('Missing `title` in request body');
        })
    })
  })

});
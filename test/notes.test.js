'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');
const Note = require('../models/note');
const { notes } = require('../db/data');
const expect = chai.expect;
const faker = require('faker');
chai.use(chaiHttp);


describe('Basic Tests for Notes Database', function(){
  // before(function () {
  //   return mongoose.connect(TEST_MONGODB_URI)
  //     .then(() => mongoose.connection.db.dropDatabase());
  // });
  
  before(function(){
  return mongoose.connect(TEST_MONGODB_URI,{useNewUrlParser:true})
  .then(()=>mongoose.connection.db.dropDatabase());
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
        title: faker.random.word(),
        content: faker.random.words()
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
        content: faker.random.words()
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
  describe('PUT /api/notes/:id', function(){
    it('Should update the item at :id and return a new item', function(){
    let putId;
    let res;
    let newItem = {
      title: faker.random.word(),
      content: faker.random.words()
    };
    let randomNumber = Math.floor(Math.random() * 8);
    return chai.request(app)
      .get(`/api/notes`)
      .then((_res) => {
       res = _res;
       return Note.findOne().skip(randomNumber);
      })
      .then((__res) => {
        putId = __res.id
        return chai.request(app)
          .put(`/api/notes/${putId}`)
          .send(newItem)
          .then((___res) => {
            res = ___res;
            expect(res).to.be.json;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body.title).to.equal(newItem.title);
            expect(res.body.content).to.equal(newItem.content);
            return res.body;
          })
      })
      .then((___res) => {
        res = ___res;
        return chai.request(app)
        .get(`/api/notes/${putId}`)
        .then((returnedItem) => {
          expect(returnedItem).to.be.json;
          expect(returnedItem).to.have.status(200);
          expect(returnedItem.body).to.be.an('object');
          expect(returnedItem.body.title).to.equal(res.title);
          expect(returnedItem.body.content).to.equal(res.content);
          expect(String(new Date(returnedItem.body.createdAt))).to.equal(String(Date(res.createdAt)));
          expect(String(new Date(returnedItem.body.updatedAt))).to.equal(String(Date(res.updatedAt)));
        })
      })
    })
    it('Should return an error if the id does not exist', function(){
      let fakeId = 500000
      let newItem = {
        title: faker.random.word(),
        content: faker.random.words()
      };
      return chai.request(app)
        .put(`/api/notes/${fakeId}`)
        .send(newItem)
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal(`${fakeId} is not a valid id`)
        })
    })
  })

  describe('DELETE /api/notes:id', function(){
    it('Should delete the note with the id', function(){
      let deleteId;
      let randomNumber = Math.floor(Math.random() * 8);
      return chai.request(app)
        .get(`/api/notes`)
        .then((res) => {
         return Note.findOne().skip(randomNumber);
      })
        .then((res) => {
          deleteId = res.id;
          return chai.request(app)
            .delete(`/api/notes/${deleteId}`)
            .then((res) => {
              expect(res).to.have.status(204);
            })
        })
        .then(() => {
          return chai.request(app)
            .get(`/api/notes/${deleteId}`)
            .then((res) => {
            expect(res).to.have.status(404);
            expect(res).to.be.json;
            expect(res.body.message).to.equal(`Not Found`);
          })
        })
    })
  })
  
});
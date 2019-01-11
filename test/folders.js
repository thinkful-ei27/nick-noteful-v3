'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Folder = require('../models/folder');

const { folders } = require('../db/data');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Noteful API - Folders', function() {
    
    //This will connect to the server and then DROP THE (data)BASE
    before(function () {
        return mongoose.connect(TEST_MONGODB_URI, {useNewURLParser: true})
          .then(() => mongoose.connection.db.dropDatabase());
    });
    //Seed the Folder database
    beforeEach(function () {
        return Folder.insertMany(folders);
    });

    //DROP DA (data)BASE
    afterEach(function() {
      return mongoose.connection.db.dropDatabase();
    });

    //Disconnect from the server
    after(function () {
        return mongoose.disconnect();
    });

    describe('GET /api/folders', function() {
    
        it('should return the correct number of Folders', function(){
          //An array of promises...
          return Promise.all([
            Folder.find(),
            chai.request(app).get('/api/folders')
        ])
          .then(([data, res]) => {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a('array');
            expect(res.body).to.have.length(data.length);
          });
        });

        it('should return a list with the correct fields', function() {
          return Promise.all([
              Folder.find().sort({ _id: '-1'}),
              chai.request(app).get('/api/folders')
          ])
            .then(([data, res]) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('array');
                expect(res.body).to.have.length(data.length);
                res.body.forEach(function(item, i){
                  expect(item).to.be.an('object');
                  expect(item).to.include.all.keys('name', 'createdAt', 'updatedAt')
                  expect(item.id).to.equal(data[i].id);
                  expect(item.name).to.equal(data[i].name);
                  expect(new Date(item.createdAt)).to.deep.equal(data[i].createdAt);
                  expect(new Date(item.updatedAt)).to.deep.equal(data[i].updatedAt);
                });
            });  
        });

        it('should return correct search results for a searchTerm query', function() {
            const searchTerm = 'Work';
            const dbResult = Folder.find({
                name: { $regex: searchTerm, $options: 'i'}
            });
            const apiResult = chai.request(app)
              .get(`/api/folders?searchTerm=${searchTerm}`);
            
            //because they're both constants, we can call them here
            return Promise.all([dbResult, apiResult])
              .then(([data, res]) => {
                  expect(res).to.have.status(200);
                  expect(res).to.be.json;
                  expect(res.body).to.been.an('array');
                  expect(res.body.length).to.equal(1);
                  //Although we will only have 1 result for now,
                  //the below allows flexibility in the future for testing
                  res.body.forEach(function(item, i) {
                      expect(item).to.be.an('object');
                      expect(item).to.include.all.keys('name', 'createdAt', 'updatedAt', 'id');
                      expect(item.id).to.equal(data[i].id);
                      expect(item.name).to.equal(data[i].name);
                      expect(new Date(item.createdAt)).to.deep.equal(data[i].createdAt);
                      expect(new Date(item.updatedAt)).to.deep.equal(data[i].updatedAt);
                  });
              });
        });

        it('should return an empty array for an incorrect query', function() {
            const searchTerm = 'NotValid';
            const dbResult = Folder.find({
                name: { $regex: searchTerm, $options: 'i' }
            });
            const apiResult = chai.request(app).get(`/api/folders?searchTerm=${searchTerm}`)
            return Promise.all([dbResult, apiResult])
              .then(([data, res]) => {
                  expect(res).to.have.status(200);
                  expect(res).to.be.json;
                  expect(res.body).to.be.an('array');
                  expect(res.body).to.have.length(data.length);
              });
            });
        });

    describe('GET api/folders/:id', function() {
        
        it('Should return the correct folder', function() {
          let data;
          return Folder.findOne()
            .then(_data => {
                data = _data;
                return chai.request(app).get(`/api/folders/${data.id}`);
            })
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.all.keys('id', 'name', 'updatedAt', 'createdAt');
                expect(res.body.id).to.equal(data.id);
                expect(res.body.name).to.equal(data.name);
                expect(new Date(res.body.createdAt)).to.deep.equal(data.createdAt);
                expect(new Date(res.body.updatedAt)).to.deep.equal(data.updatedAt);
            });
        });
        
        it('should respond with status 400 and an error message for invalid id', function() {
          let id = `NOT-A-VALID-ID`;
          return chai.request(app)
            .get(`/api/folders/${id}`)
            .then(res => {
              expect(res).to.have.status(400);
              expect(res.body.message).to.equal(`${id} is not a valid id`);
            });  
        });

        it('should respond with a 404 for an id that does not exist', function() {
            return chai.request(app)
              .get('/api/folders/DOESNOTEXIST')
              .then(res => {
                  expect(res).to.have.status(404);
              });
        });
    });

    describe('POST /api/folders', function() {

        it('should create and return a new folder when provided valid data', function() {
            const newItem = {
                'name': 'Love Letters'
            };
            let res;
            return chai.request(app)
              .post('/api/folders')
              .send(newItem)
              .then(function (_res) {
                res = _res;
                expect(res).to.have.status(201);
                expect(res).to.have.header('location');
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
                return Folder.findById(res.body.id);
              })
              .then(data => {
                expect(res.body.id).to.equal(data.id);
                expect(res.body.name).to.equal(data.name);
                expect(new Date(res.body.createdAt)).to.deep.equal(data.createdAt);
                expect(new Date(res.body.updatedAt)).to.deep.equal(data.updatedAt);
              });
        });

        it('should return an error when missing `name` field', function () {
          const newItem = {};
          return chai.request(app)
            .post('/api/folders')
            .send(newItem)
            .then(res => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body.message).to.equal(`Missing 'name' in request body`);
            });
        });
    });
    
    describe('PUT /api/folders/:id', function() {

        it('should update the note when provided valid data', function() {
            const updatedItem = {
                'name': 'Unique Name'
            };
            let res, original;
            return Folder.findOne()
              .then(_original => {
                  original = _original;
                  return chai.request(app)
                    .put(`/api/folders/${original.id}`)
                    .send(updatedItem);
              })
              .then(function (_res) {
                  res = _res;
                  expect(res).to.have.status(200);
                  expect(res).to.be.json;
                  expect(res.body).to.be.an('object');
                  expect(res.body).to.have.all.keys('id', 'createdAt', 'updatedAt', 'name');
                  return Folder.findById(res.body.id);
              })
              .then(data => {
                  expect(res.body.name).to.equal(data.name);
                  expect(new Date(res.body.createdAt)).to.deep.equal(data.createdAt);
                  expect(new Date(res.body.updatedAt)).to.deep.equal(data.updatedAt);
                  expect(new Date(res.body.updatedAt)).to.greaterThan(original.updatedAt);
              });
        });

        it('should respond with status 400 and an error message when `id` is not valid', function() {
            const updatedFolder = {
                'name': 'Happy Times'
            };
            let id = `NOT-A-VALID-ID`;
            return chai.request(app)
              .put(`/api/folders/${id}`)
              .send(updatedFolder)
              .then(res => {
                  expect(res).to.have.status(400);
                  expect(res.body.message).to.equal(`${id} is not a valid id`);
              });
        });

        it('should respond with a 404 for an id that does not exist', function(){
          const updatedFolder = {
              'name': 'Sad Times'
          };
          return chai.request(app)
            .put(`/api/folders/DOESNOTEXIST`)
            .send(updatedFolder)
            .then(res => {
              expect(res).to.have.status(404);
            });
        });

        it('should return an error when missing "name" field', function() {
          const updatedFolder = {};
          let data;
          return Folder.findOne()
            .then(_data => {
              data = _data;
              return chai.request(app)
                .put(`/api/folders/${data.id}`)
                .send(updatedFolder);
            })
            .then(res => {
              expect(res).to.have.status(400);
              expect(res).to.be.json;
              expect(res.body).to.be.an('object');
              expect(res.body.message).to.equal('Missing name in request body');
            });
        });
    });

    describe('DELETE /api/folders/:id', function() {
        it('should delete an existing folder and respond with 204', function(){
          let data;
          return Folder.findOne()
            .then(_data => {
              data = _data;
              return chai.request(app).delete(`/api/folders/${data.id}`);
            })
            .then(function (res) {
              expect(res).to.have.status(204);
              return Folder.countDocuments({ _id: data.id});
            })
            .then(count => {
              expect(count).to.equal(0);
            });
        });
    });
});
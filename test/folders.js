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
                  expect(item._id).to.equal(data[i].id);
                  expect(item.name).to.equal(data[i].name);
                  expect(new Date(item.createdAt)).to.deep.equal(data[i].createdAt);
                  expect(new Date(item.updatedAt)).to.deep.equal(data[i].updatedAt);
                });
            });  
        });


    })


})
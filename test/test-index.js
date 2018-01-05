'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const should = chai.should();

const { Cloud } = require ('../models');
const { app, runServer, closeServer } = require ('../index.js');
const {TEST_DATABASE_URL, PORT, CLIENT_ORIGIN} = require('../config');

chai.use(chaiHttp);

function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

function seedCloudData() {
  console.info('seeding blog post data');
  const seedData = [];
  for (let i = 1; i <= 10; i++) {
    seedData.push({
      id: faker.random.number(),
      title: faker.lorem.sentence(),
      text: faker.lorem.paragraph(),
      words: [faker.lorem.word()],
      font: faker.lorem.word(),
      color: faker.commerce.color(),
      createdOn: faker.date.past(),
      upvotes: faker.random.number(),
      downvotes: faker.random.number()
    });
  }
  return Cloud.insertMany(seedData);
}

describe('word cloud API resource', function() {
  before(function () {
    return runServer(PORT, TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedCloudData();
  });

  afterEach(function(){
    return tearDownDb();
  });

  after(function(){
    return closeServer();
  });

  describe('GET endpoint', function() {

    it('should return all existing wordclouds', function() {
      let res;
      return chai.request(app)
        .get('/clouds')
        .then(response => {
          // console.log('here:', response);
          response.should.have.status(200);
          res = response;
          res.body.length.should.be.above(1);

          return Cloud.count();
        })
        .then(count => {
          res.body.length.should.equal(count);
        });
    });

    it ('should return clouds with the right fields', function() {

      let resCloud;
      return chai.request(app)
        .get('/clouds')
        .then (function (res) {
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.length.of.at.least(1);

          res.body.forEach(function (cloud) {
            cloud.should.be.a('object');
            cloud.should.include.keys('id', 'title', 'text', 'words', 'font', 'color', 'createdOn', 'upvotes', 'downvotes');
          });

          resCloud = res.body[0];
          return Cloud.findById(resCloud.id);
        })
        .then(cloud => {
          resCloud.title.should.equal(cloud.title);
          resCloud.text.should.equal(cloud.text);
          resCloud.font.should.equal(cloud.font);
          resCloud.color.should.equal(cloud.color);
        });
    });
  });

  describe('POST endpoint', function() {
    it('should add a new wordcloud', function(){
      const newCloud = {
        title: faker.lorem.sentence(),
        text: faker.lorem.paragraph(),
        words: [faker.lorem.word()],
        font: faker.lorem.word(),
        color: faker.commerce.color()
      };

      return chai.request(app)
        .post('/clouds')
        .send(newCloud)
        .then(function (res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys(
            'id', 'title', 'text', 'words', 'font', 'color', 'createdOn', 'upvotes', 'downvotes');
          res.body.title.should.equal(newCloud.title);
          res.body.id.should.not.be.null;
          res.body.text.should.equal(newCloud.text);
          res.body.words.should.be.a('array');
          res.body.font.should.equal(newCloud.font);
          res.body.color.should.equal(newCloud.color);
          return Cloud.findById(res.body.id);
        })
        .then(function (cloud) {
          cloud.title.should.equal(newCloud.title);
          cloud.text.should.equal(newCloud.text);
          cloud.words[0].should.equal(newCloud.words.toString());
          cloud.font.should.equal(newCloud.font);
          cloud.color.should.equal(newCloud.color);
        });
    });
  });

});

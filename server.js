'use strict';

const express = require('express');
const {Cloud} = require('./models');
const bodyParser = require('body-parser');

const app = express;

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.get('/api/clouds', (req, res)=>{
  Cloud
    .find().sort({createdOn: -1})
    .then(clouds => {res.json(clouds.map(cloud => cloud.apiRepr()));})
    .catch (err => {
      console.error(err);
      res.status(500).json({error: 'something went wrong'});
    });
});

app.post('/api/clouds', jsonParser, (req, res) => {
  const requiredFields = ['words', 'font', 'color'];
  for (let i=0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Cloud
    .create({
      words: req.body.words,
      font: req.body.font,
      color: req.body.color
    })
    .then(cloud => {
      console.log(cloud);
      res.status(201).json(cloud.apiRepr());
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went wrong'});
    })
})
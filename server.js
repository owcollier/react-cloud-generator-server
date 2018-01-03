'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const {Cloud} = require('./models');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const {PORT, CLIENT_ORIGIN, DATABASE_URL} = require('./config');
const app = express();
const mongoose = require('mongoose');
const data = require('./seed-data');

let server;

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

app.use(bodyParser.json());

//get endpoint for all clouds
app.get('/clouds', (req, res)=>{
  // res.json(data);
  Cloud
    .find().sort({createdOn: -1})
    .then(clouds => {
      res.json(clouds.map(cloud => cloud.apiRepr()));
    })
    .catch (err => {
      console.error(err);
      res.status(500).json({error: 'something went wrong'});
    });
});

//get endpoint for a single cloud
app.get('/clouds/:id', (req, res) => {
  Cloud
    .findById(req.params.id)
    .then(cloud => res.json(cloud.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went wrong' });
    });
});

//post endpoint to create a new word cloud
app.post('/clouds', (req, res) => {
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
    });
});

//put endpoint to be able to increment upvotes & downvotes
app.put('/clouds/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['upvotes', 'downvotes'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Cloud
    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedPost => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Something went wrong' }));
});

//delete endpoint to be able to delete a cloud
app.delete('/clouds/:id', (req, res) => {
  Cloud
    .findByIdAndRemove(req.params.id)
    .then(() => {
      console.log(`Deleted word cloud with id \`${req.params.ID}\``);
      res.status(204).end();
    });
});

function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, { useMongoClient: true }, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

if (require.main === module) {
  runServer();
}

module.exports = {app};

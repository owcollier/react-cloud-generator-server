'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const {Cloud} = require('./models');
const bodyParser = require('body-parser');
const app = express();
// const data = require('./seed-data');

const {PORT, CLIENT_ORIGIN} = require('./config');
const {dbConnect} = require('./db-mongoose');

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
  const requiredFields = ['title', 'text', 'words', 'font', 'color'];
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
      title: req.body.title,
      text: req.body.text,
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
  if (!(req.params.id === req.body.id)) {
    console.log('Bleq!');
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['title', 'text', 'words', 'font', 'color'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Cloud
    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(function(updatedCloud) {
      console.log(updatedCloud);
      res.status(201).location(`/clouds/${req.params.id}`).json(updatedCloud);
    })
    .catch(err => res.status(500).json({ message: 'Something went wrong' }));
});

app.put('/clouds/:id/upvote', (req, res) => {
  if (!(req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['upvotes'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Cloud
    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedCloud => {
      console.log(updatedCloud);
      res.status(201).location(`/clouds/${req.params.id}/upvote`).json(updatedCloud);
    })
    .catch(err => res.status(500).json({ message: 'Something went wrong' }));
});

app.put('/clouds/:id/downvote', (req, res) => {
  if (!(req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['downvotes'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Cloud
    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedCloud => res.status(204).json(updatedCloud))
    .catch(err => res.status(500).json({ message: 'Something went wrong' }));
});

//delete endpoint to be able to delete a cloud
app.delete('/clouds/:id', (req, res) => {
  Cloud
    .findByIdAndRemove(req.params.id)
    .then(() => {
      console.log(`Deleted word cloud with id \`${req.params.ID}\``);
      res.sendStatus(204);
    });
});

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}


if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = {app};

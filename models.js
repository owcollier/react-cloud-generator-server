'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const CloudSchema = new mongoose.Schema({
    words: [{type: String, required: true}],
    font: {type: String, required: true},
    color: {type: String, required: true},
    createdOn: {type: Date, default: Date.now}
  });
  
  CloudSchema.methods.apiRepr = function(){
    return {
      id: this._id,
      words: this.words,
      createdOn: this.createdOn
    }
  };
  
  let Cloud = mongoose.model('Cloud', CloudSchema);
  
  module.exports = {Cloud};
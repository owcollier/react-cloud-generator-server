'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const CloudSchema = new mongoose.Schema({
  title: {type: String, required: true},
  text: {type: String, required: true},
  words: [String],
  font: {type: String, required: true},
  color: {type: String, required: true},
  createdOn: {type: Date, default: Date.now},
  upvotes: {type: Number, default: 0},
  downvotes: {type: Number, default: 0}
});
  
CloudSchema.methods.apiRepr = function(){
  return {
    id: this._id,
    title: this.title,
    text: this.text,
    words: this.words,
    font: this.font,
    color: this.color,
    createdOn: this.createdOn,
    upvotes: this.upvotes,
    downvotes: this.downvotes
  };
};
  
let Cloud = mongoose.model('Cloud', CloudSchema);
  
module.exports = {Cloud};
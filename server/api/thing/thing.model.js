'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ThingSchema = new Schema({
  name: String,
  info: String,
  active: Boolean,
  location: {
    lat: Number,
    lon: Number
  },
  city: String,
  headline: String,
  summary: String,
  address: String
});

module.exports = mongoose.model('Thing', ThingSchema);

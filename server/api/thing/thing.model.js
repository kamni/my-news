'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ThingSchema = new Schema({
  name: String,
  info: String,
  active: Boolean,
  location: {
    lat: 0.0,
    lon: 0.0
  },
  city: String,
  headline: String,
  summary: String,
  address: String
});

module.exports = mongoose.model('Thing', ThingSchema);

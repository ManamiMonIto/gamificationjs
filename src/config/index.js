'use strict';

const path = require('path');

try {
  require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') }).load();
} catch(e) {}

const _ = require('lodash');
const env = process.env.NODE_ENV;
const configAll = loadConfig('all');
const configEnv = loadConfig(env);
const configLocal = loadConfig(env + '.local');

function loadConfig(env) {
  try {
    return require('./environments/' + env);
  } catch(err) {
    return {};
  }
}

module.exports = _.merge({}, configAll, configEnv, configLocal, { env: env });

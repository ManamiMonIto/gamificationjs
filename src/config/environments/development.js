'use strict';

const port = process.env.PORT;

module.exports = {
  json: {
    pretty: true,
    spaces: 2
  },

  logging: {
    format: 'dev'
  },

  port: port,
  url: `http://localhost:${port}`
};

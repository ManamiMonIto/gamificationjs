/* eslint-disable */

const pkg = require("./package.json");
const name = pkg.name;

module.exports = {
  apps: [
    {
      name: name,
      script: "src/server.js",
      min_uptime: "5s",
      max_restarts: 5
    }
  ]
};

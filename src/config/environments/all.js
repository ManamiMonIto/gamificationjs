'use strict'

module.exports = {
  appName: 'gamificationjs',

  json: {
    pretty: false,
    spaces: 2
  },

  logging: {
    format: 'common'
  },

  port: process.env.PORT,
  url: process.env.URL || 'http://localhost:8080',

  JWTsecret: process.env.JWT_SECRET,

  server: {
    cookieSignature: process.env.COOKIE_SIGNATURE || 'super-secret-key'
  }
}

const dotenv = require('dotenv')
dotenv.config()
const path = require('path')


module.exports = {
  testing: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8'
    },
    debug: true,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: path.join(__dirname, 'src', 'db', 'migrations'),
      tableName: 'migrations'
    },
    seeds: {
      directory: path.join(__dirname, 'src', 'db', 'seeds', 'testing')
    }
  },
  development: {
    client: 'pg',
    connection: {
      port: process.env.DB_PORT,
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8'
    },
    debug: true,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: path.join(__dirname, 'src', 'db', 'migrations'),
      tableName: 'migrations'
    },
    seeds: {
      directory: path.join(__dirname, 'src', 'db', 'seeds', 'development')
    }
  },
  production: {
    client: 'pg',
    connection: {
      port: process.env.DB_PORT,
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8'
    },
    debug: true,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: path.join(__dirname, 'src', 'db', 'migrations'),
      tableName: 'migrations'
    },
    seeds: {
      directory: path.join(__dirname, 'src', 'db', 'seeds', 'production')
    }
  }
}

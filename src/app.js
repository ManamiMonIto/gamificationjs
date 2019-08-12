'use strict'

const fs = require('fs')
// const config = require('./config')
// const logger = require('koa-morgan').middleware
const path = require('path')
const cors = require('@koa/cors')
const helmet = require('koa-helmet')
const morgan = require('koa-morgan')
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
// const session = require('koa-session')
// const passport = require('koa-passport')
const staticCache = require('koa-static-cache')

const accessLogStream = fs.createWriteStream(
  __dirname + '/logs/access.log', { flags: 'a' }
)

const app = new Koa()

const attachConfigMiddleware = require('./middlewares/config')
const attachModelsMiddleware = require('./middlewares/models')
const router = require('./routes')

// app.use(logger(config.logging.format))
app.use(morgan('combined', { stream: accessLogStream }))
app.use(cors())
app.use(helmet())
app.use(bodyParser())
app.use(staticCache(path.join(__dirname, 'public'), {
  maxAge: 365 * 24 * 60 * 60  //- 1 year is 31536000 seconds
}))

app.use(attachConfigMiddleware)
app.use(attachModelsMiddleware)

app.use(router.routes())
app.use(router.allowedMethods())

module.exports = app

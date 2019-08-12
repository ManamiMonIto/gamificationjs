const { version } = require('../../package.json')

const index = (ctx) => {
  ctx.body = 'Mr. Watson, come here. I want to see you.'
}

const versionEnd = (ctx) => {
  ctx.status = 200
  ctx.body = version
}

module.exports = { index, versionEnd }

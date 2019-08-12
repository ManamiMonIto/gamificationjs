const Exception = require('../utils/exception')

// TODO: consider https://github.com/koajs/error
export default async (ctx, next) => {
  try {
    return next()
  } catch (err) {
    if (err instanceof Exception) {
      ctx.body = err.toObject()
      ctx.status = err.statusCode
    } else {
      ctx.body = { message: 'Unexpected error.' }
      ctx.status = 500
    }
  }
}
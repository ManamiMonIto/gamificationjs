class Exception extends Error {
  constructor(statusCode, message) {
    super(message)
    this._statusCode = statusCode
  }

  get statusCode() {
    return this._statusCode
  }

  toObject() {
    return {
      statusCode: this._statusCode,
      message: this.message
    }
  }
}

module.exports = Exception

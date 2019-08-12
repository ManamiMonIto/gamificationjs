const isNumber = function(str) {
  return !isNaN(str) && !isNaN(parseFloat(str));
}

const convertJSDateToSQLDate = function(date) {
  return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
}

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

const objIsEmpty = (obj) => {
  return Object.keys(obj).length === 0 && obj.constructor === Object
}

module.exports =  {
  isNumber,
  convertJSDateToSQLDate,
  asyncForEach,
  objIsEmpty
}

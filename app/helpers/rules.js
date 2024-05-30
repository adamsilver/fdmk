const _ = require('lodash')

const rules = {
  notEmpty: (value) => {
    let valid = true
    if(!value || value.trim().length == 0) {
      valid = false
    }
    return valid
  },
  radioSelected: (value) => {
    let valid = true
    if(typeof value == 'undefined') {
      valid = false;
    }
    return valid
  },
  checkboxSelected: (value) => {
    let valid = true
    if(value == '_unchecked') {
      valid = false
    }
    return valid
  },
  notEmptyDate: (date) => {
    let valid = true
    if(date.day == '' && date.month == '' && date.year == '') {
      valid = false
    }
    return valid
  },
  notEmptyDay: (date) => {
    let valid = true
    if(date.day == '') {
      valid = false
    }
    return valid
  },
  notEmptyMonth: (date) => {
    let valid = true
    if(date.month == '') {
      // valid =
    }
    return valid
  },
  notEmptyYear: (date) => {
    let valid = true
    if(date.year == '') {
      valid = false
    }
    return valid
  }
}

module.exports = rules
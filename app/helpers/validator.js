const _ = require('lodash');

function Validator(req, res) {
  this.req = req;
  this.res = res;
	this.validators = [];
	this.errors = [];
}

Validator.prototype.add = function(params) {
	this.validators.push(params);
};

Validator.prototype.getErrors = function() {
	return this.errors;
};

Validator.prototype.getFormattedErrors = function() {
	return this.errors.map(this.formatError);
};

Validator.prototype.getInlineErrors = function() {
  let inlineErrors = {}
  this.errors.forEach(error => {
    const { name, message } = error;
    _.set(inlineErrors, name, { text: message })
  });
  return inlineErrors
};

Validator.prototype.getErrorSummary = function() {
  return { items: this.getFormattedErrors() }
};

Validator.prototype.getErrorHighlights = function() {
  return this.highlights
};

Validator.prototype.formatError = function(error) {
	return {
    text: error.message,
		href: '#' + error.name
	};
};

Validator.prototype.validate = function() {
  this.generateErrors()
  this.generateHighlights()
  this.errors.length === 0
}

// For error messages (show 1 per field)
Validator.prototype.generateErrors = function() {
  this.errors = []

  for( let validator of this.validators ) {
    const { name, rules } = validator;
    const value = _.get(this.req.body, name)

    for( let rule of rules ){
      const { fn, params, message } = rule;
      const validatorReturnValue = fn( value, params );

      if(typeof validatorReturnValue === 'boolean' && !validatorReturnValue ){
        this.errors.push( { name, message } );
        break;
      } else if(typeof validatorReturnValue == 'string') {
        this.errors.push( { name: validatorReturnValue, message } );
        break;
      }
    }
  }
}

// For highlighting inputs with a red border (show all per field - for date inputs basically)
Validator.prototype.generateHighlights = function() {
  this.highlights = {}

  for( let validator of this.validators ) {
    const { name, rules } = validator;
    const value = _.get(this.req.body, name)

    for( let rule of rules ){
      const { fn, params } = rule;
      const validatorReturnValue = fn( value, params );

      if(typeof validatorReturnValue === 'boolean' && !validatorReturnValue ){
        _.set(this.highlights, name, {})
      } else if(typeof validatorReturnValue == 'string') {
        _.set(this.highlights, validatorReturnValue, {})
      }
    }
  }
}


module.exports = Validator;
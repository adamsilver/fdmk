App.Stepper = function(options) {
	this.input = $(options.input);
	this.min = parseInt(this.input.attr('min'), 10) || 0
	this.max = parseInt(this.input.attr('max'), 10) || null
	this.container = this.input.parent();
	this.setOptions(options);
	this.wrapper = $('<div class="stepper"></div>');
	this.wrapper.append(this.input);
	this.container.append(this.wrapper);
	this.createRemoveButton();
	this.createAddButton();
	this.createStatusBox();
	this.wrapper.on('click', '.stepper-removeButton', $.proxy(this, 'onRemoveClick'));
	this.wrapper.on('click', '.stepper-addButton', $.proxy(this, 'onAddClick'));
}

App.Stepper.prototype.createStatusBox = function() {
	this.statusBox = $('<div role="status" aria-live="polite" class="govuk-visually-hidden" />');
	this.wrapper.append(this.statusBox);
};

App.Stepper.prototype.setOptions = function(options) {
	var defaults = {
		removeLabel: 'Remove',
		addLabel: 'Add'
	};
	this.options = $.extend(defaults, options);
};

App.Stepper.prototype.createRemoveButton = function() {
	this.removeButton = $('<button class="govuk-button govuk-button--secondary stepper-removeButton" type="button" aria-label="'+this.options.removeLabel+'"><span>&minus;</span></button>');
	if(this.options.labelId) {
		this.removeButton.attr('aria-describedby', this.options.labelId);
	}
	this.wrapper.append(this.removeButton);
};

App.Stepper.prototype.createAddButton = function() {
	this.addButton = $('<button class="govuk-button govuk-button--secondary stepper-addButton" type="button" aria-label="'+this.options.addLabel+'"><span>&plus;</span></button>');
	if(this.options.labelId) {
		this.addButton.attr('aria-describedby', this.options.labelId);
	}
	this.wrapper.append(this.addButton);
};

App.Stepper.prototype.getInputValue = function() {
	var val = parseInt(this.input.val(), 10);
	if(isNaN(val)) {
		val = 0;
	}
	return val;
};

App.Stepper.prototype.onRemoveClick = function(e) {
	var newVal = this.getInputValue() - 1; //2=>1 and min=1
	if(newVal < this.min) {
		return
	}

	this.input.val(newVal);
	this.updateStatusBox(newVal);
};

App.Stepper.prototype.onAddClick = function(e) {
	var newVal = this.getInputValue() + 1;

	if(this.max && newVal > this.max) {
		return
	}

	this.input.val(newVal);
	this.updateStatusBox(newVal);
};

App.Stepper.prototype.updateStatusBox = function(val) {
	this.statusBox.html(val);
};
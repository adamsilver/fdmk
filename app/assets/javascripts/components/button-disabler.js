App.ButtonDisabler = function(options) {
  this.button = $(options.container);
  this.form = this.button.parent('form')
  this.form.on('submit', this.onSubmit.bind(this))
};

App.ButtonDisabler.prototype.onSubmit = function(e) {
  if(this.button.attr('aria-disabled') == 'true') {
    e.preventDefault();
  } else {
    this.button.attr('aria-disabled', 'true')
    this.button.text('Please wait...')
  }
}
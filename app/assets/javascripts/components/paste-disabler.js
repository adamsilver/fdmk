App.PasteDisabler = function(options) {
  this.input = $(options.input);
  this.input.on('paste', this.onPaste.bind(this))
};

App.PasteDisabler.prototype.onPaste = function(e) {
  e.preventDefault();
}
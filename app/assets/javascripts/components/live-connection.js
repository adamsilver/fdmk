App.LiveConnection = function(options) {
  this.statusUrl = options.statusUrl;
  this.role = options.role;
  this.interval = options.interval || 2000;
  this.onStatus = options.onStatus || $.noop;
  this.poll();
};

App.LiveConnection.prototype.poll = function() {
  $.get(this.statusUrl, { role: this.role })
    .done($.proxy(this, 'onResponse'))
    .always($.proxy(this, 'scheduleNext'));
};

App.LiveConnection.prototype.onResponse = function(status) {
  this.onStatus(status);
};

App.LiveConnection.prototype.scheduleNext = function() {
  this.timer = setTimeout($.proxy(this, 'poll'), this.interval);
};

App.LiveConnection.prototype.stop = function() {
  clearTimeout(this.timer);
};

App.dragAndDropSupported = function() {
  var div = document.createElement('div');
  return typeof div.ondrop != 'undefined';
};

App.formDataSupported = function() {
  return typeof FormData == 'function';
};

App.fileApiSupported = function() {
  var input = document.createElement('input');
  input.type = 'file';
  return typeof input.files != 'undefined';
};

if(App.dragAndDropSupported() && App.formDataSupported() && App.fileApiSupported()) {
  var STATUS_ANNOUNCEMENT_DELAY = 1000;

  App.MultiFileUpload = function(params) {
    this.defaultParams = {
      uploadFileEntryHook: $.noop,
      uploadFileExitHook: $.noop,
      uploadFileErrorHook: $.noop,
      fileDeleteHook: $.noop,
      dropzoneHintText: 'or drop files',
      dropzoneButtonText: 'Choose files'
    };

    this.params = $.extend({}, this.defaultParams, params);
    this.container = $(this.params.container);

    this.container.addClass('app-multi-file-upload--enhanced');

    this.feedbackContainer = this.container.find('.app-multi-file__uploaded-files');
    this.setupFileInput();
    this.setupDropzone();
    this.setupLabel();
    this.setupStatusBox();
    this.container.on('click', '.app-multi-file-upload__delete', $.proxy(this, 'onFileDeleteClick'));
  };

  App.MultiFileUpload.prototype.setupDropzone = function() {
    this.fileInput.wrap('<div class="app-multi-file-upload__dropzone" />');
    this.dropzone = this.container.find('.app-multi-file-upload__dropzone');
    this.dropzone.on('dragover', $.proxy(this, 'onDragOver'));
    this.dropzone.on('dragleave', $.proxy(this, 'onDragLeave'));
    this.dropzone.on('drop', $.proxy(this, 'onDrop'));
  };

  App.MultiFileUpload.prototype.setupLabel = function() {
    this.label = $('<label for="'+this.fileInput[0].id+'" class="govuk-button govuk-button--secondary">'+ this.params.dropzoneButtonText +'</label>');
    this.dropzone.append(this.label);
    this.dropzone.append('<p class="govuk-body">' + this.params.dropzoneHintText + '</p>');
  };

  App.MultiFileUpload.prototype.setupFileInput = function() {
    this.fileInput = this.container.find('.app-multi-file-upload__input');
    this.fileInput.on('change', $.proxy(this, 'onFileChange'));
    this.fileInput.on('focus', $.proxy(this, 'onFileFocus'));
    this.fileInput.on('blur', $.proxy(this, 'onFileBlur'));
  };

  App.MultiFileUpload.prototype.setupStatusBox = function() {
    this.status = $('<div role="status" aria-live="polite" class="govuk-visually-hidden" />');
    this.dropzone.after(this.status);
    this.totalFiles = 0;
    this.completedFiles = 0;
    this.errorFiles = 0;
    this.batchActive = false;
    this.gateOpen = false;
  };

  App.MultiFileUpload.prototype.queueFiles = function(count) {
    if (!this.batchActive) {
      this.batchActive = true;
      this.gateOpen = false;
      setTimeout($.proxy(function() {
        this.gateOpen = true;
        this.updateStatus();
      }, this), STATUS_ANNOUNCEMENT_DELAY);
    }
    this.totalFiles += count;
  };

  App.MultiFileUpload.prototype.announceStatus = function(text) {
    this.status.empty();
    setTimeout($.proxy(function() {
      this.status.text(text);
    }, this), 0);
  };

  App.MultiFileUpload.prototype.updateStatus = function() {
    var pending = this.totalFiles - this.completedFiles;
    var parts = [];
    if (this.completedFiles > 0) {
      parts.push('Files uploaded');
    }
    if (this.errorFiles > 0) {
      parts.push(this.errorFiles + ' have errors');
    }
    if (pending > 0) {
      parts.push(pending + ' still in progress');
    }
    this.announceStatus(parts.join('. '));

    if (this.completedFiles >= this.totalFiles) {
      this.totalFiles = 0;
      this.completedFiles = 0;
      this.batchActive = false;
      this.gateOpen = false;
    }
  };

  App.MultiFileUpload.prototype.recordSuccess = function() {
    this.completedFiles++;
    if (this.gateOpen) {
      this.updateStatus();
    }
  };

  App.MultiFileUpload.prototype.recordError = function() {
    this.completedFiles++;
    this.errorFiles++;
    if (this.gateOpen) {
      this.updateStatus();
    }
  };

  App.MultiFileUpload.prototype.announceDeleted = function(text) {
    setTimeout($.proxy(function() {
      this.announceStatus(text);
    }, this), STATUS_ANNOUNCEMENT_DELAY);
  };

  App.MultiFileUpload.prototype.onDragOver = function(e) {
  	e.preventDefault();
  	this.dropzone.addClass('app-multi-file-upload--dragover');
  };

  App.MultiFileUpload.prototype.onDragLeave = function() {
  	this.dropzone.removeClass('app-multi-file-upload--dragover');
  };

  App.MultiFileUpload.prototype.onDrop = function(e) {
  	e.preventDefault();
  	this.dropzone.removeClass('app-multi-file-upload--dragover');
    var files = e.originalEvent.dataTransfer.files;
    this.fileInput.focus();
    this.uploadFiles(files);
  };

  App.MultiFileUpload.prototype.uploadFiles = function(files) {
    this.feedbackContainer.find('.app-multi-file-upload__row--error').remove();
    this.errorFiles = 0;
    files = Array.from(files);
    this.queueFiles(files.length);
    files.forEach($.proxy(function(file) {
      var error = this.validateFile(file);
      if (error) {
        this.renderInstantError(file, error);
      } else {
        this.uploadFile(file);
      }
    }, this));
  };

  App.MultiFileUpload.prototype.escapeHtml = function(string) {
    return $('<div>').text(string).html();
  };

  App.MultiFileUpload.prototype.formatMessage = function(template, filename) {
    return template.replace('{filename}', this.escapeHtml(filename));
  };

  App.MultiFileUpload.prototype.validateFile = function(file) {
    if (this.params.allowedTypes && file.type && this.params.allowedTypes.indexOf(file.type) === -1) {
      return this.formatMessage(this.params.fileTypeError, file.name);
    }
    if (this.params.maxFileSize && file.size > this.params.maxFileSize) {
      return this.formatMessage(this.params.fileSizeError, file.name);
    }
    return null;
  };

  App.MultiFileUpload.prototype.renderInstantError = function(file, message) {
    var item = $(this.getFileRowHtml(file));
    this.feedbackContainer.find('.app-multi-file-upload__list').append(item);
    this.feedbackContainer.show();
    item.addClass('app-multi-file-upload__row--error');
    item.find('.app-multi-file-upload__message').html(this.getErrorHtml(message));
    this.recordError();
  };

  App.MultiFileUpload.prototype.onFileChange = function(e) {
    var files = e.currentTarget.files;
    this.uploadFiles(files);
    this.fileInput.val('');
  };

  App.MultiFileUpload.prototype.onFileFocus = function(e) {
    this.label.addClass('app-multi-file-upload--focused');
  };

  App.MultiFileUpload.prototype.onFileBlur = function(e) {
    this.label.removeClass('app-multi-file-upload--focused');
  };

  App.MultiFileUpload.prototype.getSuccessHtml = function(success) {
    return '<span class="app-multi-file-upload__success">' + success.messageHtml + '</span>';
  };

  App.MultiFileUpload.prototype.getErrorHtml = function(message) {
    return '<span class="app-multi-file-upload__error">' + message + '</span>';
  };

  App.MultiFileUpload.prototype.getFileRowHtml = function(file) {
    var html = '';
    html += '<div class="govuk-summary-list__row app-multi-file-upload__row">';
    html += '  <div class="govuk-summary-list__value app-multi-file-upload__message">';
    html +=       '<span class="app-multi-file-upload__filename">'+file.name+'</span>';
    html +=       ' <span class="app-multi-file-upload__progress">0%</span>';
    html += '  </div>';
    html += '  <div class="govuk-summary-list__actions app-multi-file-upload__actions"></div>';
    html += '</div>';
    return html;
  };

  App.MultiFileUpload.prototype.getDeleteButtonHtml = function(file) {
    var html = '<button class="app-multi-file-upload__delete" type="button" name="delete" value="' + file.filename + '">';
    html += 'Delete <span class="govuk-visually-hidden">' + file.originalname + '</span>';
    html += '</button>';
    return html;
  };

  App.MultiFileUpload.prototype.uploadFile = function(file) {
    this.params.uploadFileEntryHook(this, file);
    var formData = new FormData();
    formData.append(this.params.fieldName, file);
    var item = $(this.getFileRowHtml(file));
    this.feedbackContainer.find('.app-multi-file-upload__list').append(item);
    this.feedbackContainer.show();

    $.ajax({
      url: this.params.uploadUrl,
      type: 'post',
      data: formData,
      processData: false,
      contentType: false,
      success: $.proxy(function(response){
        if(response.error) {
          item.addClass('app-multi-file-upload__row--error');
          item.find('.app-multi-file-upload__message').html(this.getErrorHtml(response.error.message));
          this.recordError();
        } else {
          item.find('.app-multi-file-upload__message').html(this.getSuccessHtml(response.success));
          item.find('.app-multi-file-upload__actions').append(this.getDeleteButtonHtml(response.file));
          this.recordSuccess();
        }
        this.params.uploadFileExitHook(this, file, response);
      }, this),
      error: $.proxy(function(jqXHR, textStatus, errorThrown) {
        item.addClass('app-multi-file-upload__row--error');
        item.find('.app-multi-file-upload__message').html(
          this.getErrorHtml(file.name + ' could not be uploaded')
        );
        this.recordError();
        this.params.uploadFileErrorHook(this, file, jqXHR, textStatus, errorThrown);
      }, this),
      xhr: function() {
        var xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', function(e) {
          if (e.lengthComputable) {
            var percentComplete = e.loaded / e.total;
            percentComplete = parseInt(percentComplete * 100, 10);
            item.find('.app-multi-file-upload__progress').text(' ' + percentComplete + '%');
          }
        }, false);
        return xhr;
      }
    });
  };

  App.MultiFileUpload.prototype.onFileDeleteClick = function(e) {
    e.preventDefault();
    var button = $(e.currentTarget);
    var data = {};
    data[button[0].name] = button[0].value;
    $.ajax({
      url: this.params.deleteUrl,
      type: 'post',
      dataType: 'json',
      data: data,
      success: $.proxy(function(response){
        if(response.error) {
          // handle error
        } else {
          var filename = button.find('.govuk-visually-hidden').text();
          button.parents('.app-multi-file-upload__row').remove();
          this.announceDeleted(filename + ' deleted.');
          if (this.feedbackContainer.find('.app-multi-file-upload__row').length === 0) {
            this.feedbackContainer.hide();
          }
        }
        this.params.fileDeleteHook(this, response);
      }, this)
    });
  };
}
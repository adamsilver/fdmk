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
  App.MultiFileUpload = function(params) {
    this.defaultParams = {
      uploadFileEntryHook: $.noop,
      uploadFileExitHook: $.noop,
      uploadFileErrorHook: $.noop,
      fileDeleteHook: $.noop,
      uploadStatusText: 'Uploading files, please wait',
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
    this.status = $('<div aria-live="polite" role="status" class="govuk-visually-hidden" />');
    this.dropzone.append(this.status);
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
    this.status.html(this.params.uploadStatusText);
  	this.uploadFiles(e.originalEvent.dataTransfer.files);
  };

  App.MultiFileUpload.prototype.uploadFiles = function(files) {
    this.feedbackContainer.find('.app-multi-file-upload__row--error').remove();
    this.uploadFilesSequentially(Array.from(files), 0);
  };

  App.MultiFileUpload.prototype.uploadFilesSequentially = function(files, index) {
    if (index >= files.length) { return; }
    this.uploadFile(files[index], $.proxy(function() {
      this.uploadFilesSequentially(files, index + 1);
    }, this));
  };

  App.MultiFileUpload.prototype.onFileChange = function(e) {
    this.status.html(this.params.uploadStatusText);
    this.uploadFiles(e.currentTarget.files);
    this.fileInput.replaceWith($(e.currentTarget).val('').clone(true));
    this.setupFileInput();
    this.fileInput.focus();
  };

  App.MultiFileUpload.prototype.onFileFocus = function(e) {
    this.label.addClass('app-multi-file-upload--focused');
  };

  App.MultiFileUpload.prototype.onFileBlur = function(e) {
    this.label.removeClass('app-multi-file-upload--focused');
  };

  App.MultiFileUpload.prototype.getSuccessHtml = function(success) {
    return '<span class="app-multi-file-upload__success">' + success.messageHtml + ' added</span>';
  };

  App.MultiFileUpload.prototype.getErrorHtml = function(error) {
    return '<span class="app-multi-file-upload__error">' + error.message + '</span>';
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

App.MultiFileUpload.prototype.uploadFile = function(file, done) {
    this.params.uploadFileEntryHook(this, file);
    var formData = new FormData();
    formData.append(this.params.fieldName, file);
    this.feedbackContainer.find('.app-multi-file-upload__no-files').addClass('app-hidden');
    var item = $(this.getFileRowHtml(file));
    this.feedbackContainer.find('.app-multi-file-upload__list').append(item);

    $.ajax({
      url: this.params.uploadUrl,
      type: 'post',
      data: formData,
      processData: false,
      contentType: false,
      success: $.proxy(function(response){
        if(response.error) {
          item.addClass('app-multi-file-upload__row--error');
          item.find('.app-multi-file-upload__message').html(this.getErrorHtml(response.error));
          this.status.html(response.error.message);
        } else {
          item.find('.app-multi-file-upload__message').html(this.getSuccessHtml(response.success));
          item.find('.app-multi-file-upload__actions').append(this.getDeleteButtonHtml(response.file));
          this.status.html(response.success.messageText);
        }
        this.params.uploadFileExitHook(this, file, response);
        if(done) { done(); }
      }, this),
      error: $.proxy(function(jqXHR, textStatus, errorThrown) {
        item.addClass('app-multi-file-upload__row--error');
        item.find('.app-multi-file-upload__message').html(
          this.getErrorHtml({ message: file.name + ' could not be uploaded' })
        );
        this.status.html(file.name + ' could not be uploaded');
        this.params.uploadFileErrorHook(this, file, jqXHR, textStatus, errorThrown);
        if(done) { done(); }
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
          if(this.feedbackContainer.find('.app-multi-file-upload__row').length === 0) {
            this.feedbackContainer.find('.app-multi-file-upload__no-files').removeClass('app-hidden');
            this.status.html(filename + ' deleted. No files uploaded.');
          } else {
            this.status.html(filename + ' deleted.');
          }
        }
        this.params.fileDeleteHook(this, response);
      }, this)
    });
  };
}
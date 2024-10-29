App.AddAnother = function (options) {
  this.options = options
  this.container = $(options.container)
  this.container.on('click', '.app-add-another__remove-button', $.proxy(this, 'onRemoveButtonClick'))
  this.container.on('click', '.app-add-another__add-button', $.proxy(this, 'onAddButtonClick'))
  this.container.find('.app-add-another__add-button, app-add-another__remove-button').prop('type', 'button')
  this.container.find('.app-add-another__heading').attr('tabindex', '-1')
}

App.AddAnother.prototype.onAddButtonClick = function (e) {
  var firstItem = this.getItems().first()
  if (this.options.allowNoFields && firstItem.hasClass('govuk-!-display-none')) {
    firstItem.removeClass('govuk-!-display-none')
    this.createRemoveButton(firstItem)
    firstItem.find('input, textarea, select').first().focus()
    return
  }

  var item = this.getNewItem()
  if (!this.hasRemoveButton(firstItem)) {
    this.createRemoveButton(firstItem)
  }
  this.updateAttributes(this.getItems().length, item)
  this.resetItem(item)

  this.getItems().last().after(item)
  item.find('input, textarea, select').first().focus()
}

App.AddAnother.prototype.hasRemoveButton = function (item) {
  return item.find('.app-add-another__remove-button').length
}

App.AddAnother.prototype.getItems = function () {
  return this.container.find('.app-add-another__item')
}

App.AddAnother.prototype.getNewItem = function () {
  var item = this.getItems().first().clone()
  if (!this.hasRemoveButton(item)) {
    this.createRemoveButton(item)
  }
  return item
}

App.AddAnother.prototype.updateAttributes = function (index, item) {
  item.find('[data-name]').each(function (i, el) {
    el.name = $(el).attr('data-name').replace(/%index%/, index);
    el.id = $(el).attr('data-id').replace(/%index%/, index);
    ($(el).siblings('label')[0] || $(el).parents('label')[0]).htmlFor = el.id;

    // Update the label text with the index
    if($(el).attr('data-label')) {
      ($(el).siblings('label')[0] || $(el).parents('label')[0]).innerHTML = $(el).attr('data-label').replace(/%index%/, index+1);
    }
  })
  // Update legend
  if(item.find('legend').length) {
    item.find('legend:first').html(item.attr('data-label').replace(/%index%/, index+1))
  }

  // Update remove button visually hidden label
  if(item.find('.app-add-another__remove-button').length) {
    item.find('.app-add-another__remove-button .govuk-visually-hidden').html(item.attr('data-label').replace(/%index%/, index+1))
  }

}

App.AddAnother.prototype.createRemoveButton = function (item) {
  item.find('.app-add-another__title').after('<button type="button" class="govuk-button govuk-button--secondary app-add-another__remove-button">Remove <span class="govuk-visually-hidden">Day {{loop.index}}</span></button>')
}

App.AddAnother.prototype.resetItem = function (item) {
  item.find('[data-name], [data-id]').each(function (index, el) {
    if (el.type === 'checkbox' || el.type === 'radio') {
      el.checked = false
    } else {
      el.value = ''
    }
  })
}

App.AddAnother.prototype.onRemoveButtonClick = function (e) {

  // If no fields are allowed and there’s only one item left
  // Then hide the last item
  if (this.options.allowNoFields && this.getItems().length === 1) {
    $(e.currentTarget).parents('.app-add-another__item').addClass('govuk-!-display-none')
    this.resetItem($(e.currentTarget).parents('.app-add-another__item'))
    $(e.currentTarget).parents('.app-add-another__item').find('.app-add-another__remove-button').remove()

  // Else remove the item
  } else {
    $(e.currentTarget).parents('.app-add-another__item').remove()
    if (this.getItems().length === 1) {
      this.getItems().find('.app-add-another__remove-button').remove()
    }

    // get items again as for some reason after removing it's still included in array
    this.getItems().each($.proxy(function (index, el) {
      this.updateAttributes(index, $(el))
    }, this))

  }

  this.focusHeading()
}

App.AddAnother.prototype.focusHeading = function () {
  this.container.find('.app-add-another__heading').focus()
}

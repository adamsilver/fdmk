App.ListFilter = function(params) {
  this.params = params
  this.container = $(params.container)
  this.container.addClass('app-list-filter--enhanced')
  this.items = this.container.find("input[type='checkbox'], input[type='radio']")
  this.itemsContainer = this.container.find('.app-list-filter__container')
  this.itemsInnerContainer = this.itemsContainer.children('.app-list-filter__container-inner')
  this.legend = this.container.find('legend')
  this.setupStatusBox()
  this.setupTextBox()
  this.setupHeight()
}

App.ListFilter.prototype.setupHeading = function() {
  this.heading = $('<p class="app-list-filter__title" aria-hidden="true">' + this.legend.text() + '</p>')
  this.container.prepend(this.heading)
}

App.ListFilter.prototype.setupTextBox = function() {
  this.legend.after(this.getTextBoxHtml())
  this.textBox = this.container.find('.app-list-filter__filter-input')
  this.textBox.on('keyup', $.proxy(this, 'onTextBoxKeyUp'))
}

App.ListFilter.prototype.getTextBoxHtml = function() {
  var id = this.container[0].id
  var html = ''
  html += '<label for="' + id + '-checkbox-filter__filter-input" class="govuk-label govuk-visually-hidden">' + this.params.textBox.label + '</label>'
  html += '<input id="' + id + '-checkbox-filter__filter-input" class="app-list-filter__filter-input govuk-input" type="text" aria-describedby="' + id + '-checkboxes-status" aria-controls="' + id + '-checkboxes" autocomplete="off" spellcheck="false">'
  return html
}

App.ListFilter.prototype.setupStatusBox = function() {
  this.statusBox = $('<div class="govuk-visually-hidden" role="status" id="' + this.container[0].id + '-checkboxes-status"></div>')
  this.updateStatusBox({
    foundCount: this.getAllVisibleItems().length,
    checkedCount: this.getAllVisibleCheckedCheckboxes().length
  })
  this.container.append(this.statusBox)
}

App.ListFilter.prototype.updateStatusBox = function(params) {
  var status = '%found% options found, %selected% selected'
  status = status.replace(/%found%/, params.foundCount)
  status = status.replace(/%selected%/, params.checkedCount)
  this.statusBox.html(status)
}

App.ListFilter.prototype.onTextBoxKeyUp = function(e) {
  var ENTER_KEY = 13
  if (e.keyCode === ENTER_KEY) {
    e.preventDefault()
  } else {
    this.filterList()
  }
}

App.ListFilter.prototype.cleanString = function(text) {
  text = text.replace(/&/g, 'and')
  text = text.replace(/[’',:–-]/g, '') // remove punctuation characters
  text = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // escape special characters
  return text.trim().replace(/\s\s+/g, ' ').toLowerCase() // replace multiple spaces with one
}

App.ListFilter.prototype.filterList= function() {
  var textValue = this.cleanString(this.textBox.val())

  var allItems = this.getAllItems()
  // hide all checkboxes
  allItems.hide()

  for(var i = 0; i < allItems.length; i++ ) {
    var labelValue = this.cleanString($(allItems[i]).find('.govuk-label').text())
    if(labelValue.search(textValue) !== -1) {
      $(allItems[i]).show()
    }
  }

  this.updateStatusBox({
    foundCount: this.getAllVisibleItems().length,
    checkedCount: this.getAllVisibleCheckedCheckboxes().length
  })
}

App.ListFilter.prototype.getAllItems = function() {
  return this.itemsContainer.find('.app-list-filter__item')
}

App.ListFilter.prototype.getAllVisibleItems = function() {
  return this.getAllItems().filter(function(i, el) {
    return $(el).css('display') == 'block'
  })
}

App.ListFilter.prototype.getAllVisibleCheckedCheckboxes = function() {
  return this.getAllVisibleItems().filter(function(i, el) {
    return $(el).find('.govuk-checkboxes__input')[0].checked
  })
}

App.ListFilter.prototype.setContainerHeight = function(height) {
  this.itemsContainer.css({
    height: height
  })
}

App.ListFilter.prototype.isCheckboxInView = function(index, option) {
  var $checkbox = $(option)
  var initialOptionContainerHeight = this.itemsContainer.height()
  var optionListOffsetTop = this.itemsInnerContainer.offset().top
  var distanceFromTopOfContainer = $checkbox.offset().top - optionListOffsetTop
  return distanceFromTopOfContainer < initialOptionContainerHeight
}

App.ListFilter.prototype.getVisibleCheckboxes = function() {
  var visibleCheckboxes = this.items.filter(this.isCheckboxInView.bind(this))
  // add an extra checkbox, if the label of the first is too long it collapses onto itself
  visibleCheckboxes = visibleCheckboxes.add(this.items[visibleCheckboxes.length])
  return visibleCheckboxes
}

App.ListFilter.prototype.setupHeight = function() {
  var initialOptionContainerHeight = this.itemsContainer.height()
  var height = this.itemsInnerContainer.outerHeight(true)

  // check whether this is hidden by progressive disclosure,
  // because height calculations won't work
  if (this.itemsContainer[0].offsetParent === null) {
    initialOptionContainerHeight = 300
    height = 300
  }

  // Resize if the list is only slightly bigger than its container
  if (height < initialOptionContainerHeight + 50) {
    this.setContainerHeight(height + 1)
    return
  }

  // Resize to cut last item cleanly in half
  var lastVisibleCheckbox = this.getVisibleCheckboxes().last()
  var position = lastVisibleCheckbox.parent()[0].offsetTop // parent element is relative
  this.setContainerHeight(position + (lastVisibleCheckbox.height() / 1.5))
}

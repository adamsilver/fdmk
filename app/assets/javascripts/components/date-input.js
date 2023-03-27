App.DateInput = function(options) {
  this.container = $(options.container);
  this.dayInput = this.container.find(options.daySelector)
  this.monthInput = this.container.find(options.monthSelector)
  this.yearInput = this.container.find(options.yearSelector)
  this.container = this.container;
  options = options || {};

  this.container.addClass('app-date-input--enhanced')

  // use selected date or today's date for the month date
  this.monthDate = this.hasSelectedDate() ? this.getInputDate() : new Date();

  // use the selected date or set to null because there is no selected date
  this.selectedDate = this.hasSelectedDate() ? this.getInputDate() : null;
  this.setupOptions(options);
  this.setupKeys();
  this.setupMonthNames();
  this.setupShortMonthNames();
  this.setupToggleButton();
  this.setupCalendarHtml();
  this.updateSelectedDateStatusBox()
};

App.DateInput.prototype.setupCalendarHtml = function() {
  this.calendar = $('<div class="datepicker app-hidden" aria-label="date picker" role="group" tabindex="-1">');
  this.calendar.html(this.getCalendarHtml(this.monthDate.getFullYear(), this.monthDate.getMonth()));
  this.addEventListeners();
  this.container.append(this.calendar);
};

App.DateInput.prototype.updateSelectedDateStatusBox = function() {
  var status = (this.selectedDate ? 'The currently selected date is ' + this.getFullDateString(this.selectedDate) : '');
  this.container.find('.datepicker-selected-date').html(status)
}

App.DateInput.prototype.getFullDateString = function(d) {
  return d.getDate() + ' ' + this.monthNames[d.getMonth()] + ' ' + d.getFullYear();
}

App.DateInput.prototype.getSelectedDateElementId = function(d) {
  return this.dayInput[0].id + '-selected-date';
}

App.DateInput.prototype.getCalendarHtml = function(year, month) {
  var html = '<div id="' + this.getSelectedDateElementId() + '" class="datepicker-selected-date govuk-visually-hidden"></div>';
  html +=		'<div class="datepicker-actions">';
  html +=			'<button type="button" aria-label="previous month"><svg focusable="false" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="0.7em" height="1.1em"><path d="M7.41 10.59L2.83 6l4.58-4.59L6 0 0 6l6 6z" fill="#000" fill-rule="nonzero"/></svg></button>';
  html += 		'<div role="status" aria-live="polite" class="govuk-visually-hidden">';
  html += 			this.monthNames[month] + " " + year;
  html += 		'</div>';
  html += 		'<select>';
  html +=       this.getSelectOptionsHtml(year, month);
  html += 		'</select>';
  html +=			'<button type="button" aria-label="next month"><svg focusable="false" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="0.7em" height="1.1em"><path d="M.59 10.59L5.17 6 .59 1.41 2 0l6 6-6 6z" fill="#000" fill-rule="nonzero"/></svg></button>';
  html +=		'</div>';
  html += 	'<table role="grid">';
  html += 		'<thead>';
  html += 			'<tr>';
  html += 				'<th><span aria-hidden="true">M</span><span class="govuk-visually-hidden">Monday</span></th>';
  html += 				'<th><span aria-hidden="true">T</span><span class="govuk-visually-hidden">Tuesday</span></th>';
  html += 				'<th><span aria-hidden="true">W</span><span class="govuk-visually-hidden">Wedsday</span></th>';
  html += 				'<th><span aria-hidden="true">T</span><span class="govuk-visually-hidden">Thursday</span></th>';
  html += 				'<th><span aria-hidden="true">F</span><span class="govuk-visually-hidden">Friday</span></th>';
  html += 				'<th><span aria-hidden="true">S</span><span class="govuk-visually-hidden">Saturday</span></th>';
  html += 				'<th><span aria-hidden="true">S</span><span class="govuk-visually-hidden">Sunday</span></th>';
  html += 			'</tr>';
  html += 		'</thead>';
  html += 		'<tbody>';
  html += 			this.getCalendarTableRows(month, year);
  html += 		'</tbody>';
  html += 	'</table>';
  return html;
};

App.DateInput.prototype.getSelectOptionsHtml = function(year, month) {
  var html = '';
  var d = new Date(year, month, 1);
  d.setMonth(d.getMonth() - 24);
  for(var i = -1; i < 48; i++) {
    d.setMonth(d.getMonth() + 1);
    var selected = d.getMonth() == month && d.getFullYear() == year ? 'selected' : '';
    html +=   '<option value="' + d.toString() + '" ' + selected +'>';
    html +=     this.shortMonthNames[d.getMonth()] + ' ' + d.getFullYear()
    html +=   '</option>'
  }
  return html;
};

App.DateInput.prototype.onSelectChange = function(e) {
  this.monthDate = new Date($(e.currentTarget).val());
  this.updateCalendarHtml(this.monthDate.getFullYear(), this.monthDate.getMonth())
};

App.DateInput.prototype.hasSelectedDate = function() {
  return this.dayInput[0].value && this.monthInput[0].value && this.yearInput[0].value;
}

App.DateInput.prototype.getInputDate = function() {
  return new Date(parseInt(this.yearInput[0].value, 10), parseInt(this.monthInput[0].value, 10)-1, parseInt(this.dayInput[0].value, 10))
}

App.DateInput.prototype.setupMonthNames = function() {
  this.monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
};

App.DateInput.prototype.setupShortMonthNames = function() {
  this.shortMonthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];
};

App.DateInput.prototype.setupOptions = function(options) {
  var defaults = {};

  defaults.dateStart = (function() {
    var d = new Date();
    d.setYear(d.getFullYear()-1);
    return d;
  }());

  defaults.currentDate = (function() {
    var d = new Date();
    d.setHours(0,0,0,0);
    return d;
  }());

  this.options = $.extend(defaults, options);
};

App.DateInput.prototype.getFirstDateOfMonth = function(month, year) {
  var d = new Date();
  d.setFullYear(year,month,1,0);
  d.setHours(0,0,0,0);
  return d;
};

App.DateInput.prototype.getCalendarTableRows = function(month, year) {
  var html = '';
  var now = new Date()
  now.setHours(0,0,0,0);

  // get first day of month and first week day
  var first_day = new Date(year, month, 1),
      first_day_weekday = first_day.getDay() == 0 ? 7 : first_day.getDay();

  // find number of days in month
  var month_length = new Date(year, month+1, 0).getDate(),
      previous_month_length = new Date(year, month, 0).getDate();

  // define default day variables
  var day  = 1, // current month days
      prev = 1, // previous month days
      next = 1; // next month days

  html += '<tr class="week">';
  // weeks loop (rows)
  for (var i = 0; i < 9; i++) {
    // weekdays loop (cells)
    for (var j = 1; j <= 7; j++) {
      if (day <= month_length && (i > 0 || j >= first_day_weekday)) {
        var d = new Date(year, month, day)

        var focusableDate = null;
        if(this.selectedDate && this.selectedDate.getMonth() === d.getMonth() && this.selectedDate.getFullYear() === d.getFullYear()) { // selected date
          focusableDate = this.selectedDate;
        } else if(now.getMonth() === d.getMonth() && now.getFullYear() === d.getFullYear()) { // today
          focusableDate = now;
        } else { // 1st of month
          focusableDate = first_day;
        }

        html += this.getCellHtml(d, {
          today: d.getTime() === now.getTime() ? true : false,
          focusable: focusableDate.getTime() === d.getTime() ? true : false,
          selected: (this.selectedDate && this.selectedDate.getTime() === d.getTime()) ? true : false
        })
        day++;
      } else {
        if (day <= month_length) {
          // previous month
          html += '<td class="day other-month">';
          html += new Date(year, month-1, previous_month_length - first_day_weekday + prev + 1).getDate();
          html += '</td>';
          prev++;
        } else {
          // next month
          html += '<td class="day other-month">';
          // html += next;
          html += new Date(year, month+1, next).getDate();
          html += '</td>';
          next++;
        }
      }
    }

    // stop making rows if it's the end of month
    if (day > month_length) {
      html += '</tr>';
      break;
    } else {
      html += '</tr><tr class="week">';
    }
  }
  return html;
};

App.DateInput.prototype.getCellHtml = function(date, options) {
  var label = date.getDate() + ' ' + this.monthNames[date.getMonth()] + ' ' + date.getFullYear();

  var tdClass = '';
  if(options.today) {
    tdClass += ' datepicker-day-isToday';
  }
  if(options.focusable) {
    tdClass += ' datepicker-day-isFocused';
  }

  var html = '';
  html += '<td';

  if(options.focusable) {
    html += ' tabindex="0" ';
  } else {
    html += ' tabindex="-1" ';
  }

  if(options.selected) {
    html += ' aria-selected="true" ';
  } else {
    html += ' aria-selected="false" ';
  }

  // html += ' aria-label="'+  label + '" ';
  html += ' role="gridcell" ';
  html += ' data-date="' + date.toString() + '" ';
  html += ' class="' + tdClass + '" ';
  html += '>';

  if(options.today) {
    html += '<span class="datepicker-today">Today</span>';
  }

  html += '<span aria-hidden="true">';
  html += date.getDate();
  html += '</span>';
  html += '<span class="govuk-visually-hidden">'+label+'</a>';
  html += '</td>'

  return html;
};

App.DateInput.prototype.addEventListeners = function() {
  this.calendar.on('click', 'button:first-child', $.proxy(this, 'onPreviousClick'));
  this.calendar.on('click', 'button:last-child', $.proxy(this, 'onNextClick'));
  this.calendar.on('click', '[role=gridcell]', $.proxy(this, 'onCellClick'));
  this.calendar.on('keydown', '[role=gridcell]', $.proxy(this, 'onCellKeyDown'));
  this.calendar.on('change', 'select', $.proxy(this, 'onSelectChange'));
  this.calendar.on('keydown', $.proxy(this, 'onCalendarKeyDown'));
};

App.DateInput.prototype.setupToggleButton = function() {
  this.toggleButton = $('<button type="button" aria-haspopup="true" aria-describedby="'+this.getSelectedDateElementId()+'" class="govuk-button--secondary datepicker-toggle-button"><svg width="16" height="18" xmlns="http://www.w3.org/2000/svg" focusable="false"><path d="M12.167 10H8v4.167h4.167V10zM11.333.833V2.5H4.667V.833H3V2.5h-.833A1.66 1.66 0 00.508 4.167L.5 15.833c0 .917.742 1.667 1.667 1.667h11.666c.917 0 1.667-.75 1.667-1.667V4.167c0-.917-.75-1.667-1.667-1.667H13V.833h-1.667zm2.5 15H2.167V6.667h11.666v9.166z" fill="#505a5f" fill-rule="nonzero"/></svg> Use calendar</button>');
  this.container.append(this.toggleButton);
  this.toggleButton.on('click', $.proxy(this, 'onToggleButtonClick'));
};

App.DateInput.prototype.onToggleButtonClick = function() {
  if(this.toggleButton.attr('aria-expanded') == 'true') {
    this.hide();
  } else {
    if(this.hasSelectedDate()) {
      this.selectedDate = this.getInputDate();
      this.updateCalendarHtml(this.selectedDate.getFullYear(), this.selectedDate.getMonth())
    } else {
      this.updateCalendarHtml(this.monthDate.getFullYear(), this.monthDate.getMonth())
    }
    this.show();
    this.calendar.focus();
  }
};

App.DateInput.prototype.hide = function() {
  this.calendar.addClass('app-hidden');
  this.toggleButton.attr('aria-expanded', 'false');
};

App.DateInput.prototype.show = function() {
  this.calendar.removeClass('app-hidden');
  this.toggleButton.attr('aria-expanded', 'true');
};

App.DateInput.prototype.setupKeys = function() {
  this.keys = {
    tab:       9,
    enter:    13,
    esc:      27,
    space:    32,
    pageup:   33,
    pagedown: 34,
    end:      35,
    home:     36,
    left:     37,
    up:       38,
    right:    39,
    down:     40
    };
};

App.DateInput.prototype.onCalendarKeyDown = function(e) {
  switch(e.keyCode) {
    case this.keys.esc:
      this.hide();
      this.toggleButton.focus();
      break
  }
};

App.DateInput.prototype.onCellKeyDown = function(e) {
  switch(e.keyCode) {
    case this.keys.down:
      this.onDayDownPressed(e);
      break;
    case this.keys.up:
      this.onDayUpPressed(e);
      break;
    case this.keys.left:
      this.onDayLeftPressed(e);
      break;
    case this.keys.right:
      this.onDayRightPressed(e);
      break;
    case this.keys.space:
    case this.keys.enter:
      this.onDaySpacePressed(e);
      break;
  }
};

App.DateInput.prototype.onCellClick = function(e) {
  var d = new Date($(e.currentTarget).attr('data-date'));
  this.updateInputValues(d);
  this.selectedDate = d;
  this.selectDate(d);
  this.hide();
  this.updateSelectedDateStatusBox();
  this.toggleButton.focus();
};

App.DateInput.prototype.onPreviousClick = function(e) {
  this.showPreviousMonth();
};

App.DateInput.prototype.onNextClick = function(e) {
  this.showNextMonth();
};

App.DateInput.prototype.onDaySpacePressed = function(e) {
  e.preventDefault();
  var d = new Date($(e.currentTarget).attr('data-date'));
  this.updateInputValues(d);
  this.selectedDate = d;
  this.selectDate(d);
  this.hide();
  this.updateSelectedDateStatusBox();
  this.toggleButton.focus();
};

App.DateInput.prototype.selectDate = function(date) {
  this.calendar.find('[aria-selected=true]').attr('aria-selected', 'false');
  this.getDayCell(date).attr('aria-selected', 'true');
};

App.DateInput.prototype.unhighlightCell = function(date) {
  var cell = this.getDayCell(date);
  cell.attr('tabindex', '-1');
};

App.DateInput.prototype.highlightCell = function(date) {
  this.unhighlightCell(this.getFocusedCellDate());
  var cell = this.getDayCell(date);
  cell.attr('tabindex', '0');
  cell.focus();
};

App.DateInput.prototype.getFocusedCell = function() {
  return this.calendar.find('[tabindex="0"]');
};

App.DateInput.prototype.getFocusedCellDate = function() {
  return new Date(this.getFocusedCell().attr('data-date'));
};

App.DateInput.prototype.onDayDownPressed = function(e) {
  e.preventDefault();
  var date = this.getFocusedCellDate();
  var newDate = this.getSameDayNextWeek(date);
  if(newDate.getMonth() == date.getMonth()) {
    this.highlightCell(newDate);
  } else {
    this.monthDate = newDate;
    this.updateCalendarHtml(newDate.getFullYear(), newDate.getMonth());
    this.highlightCell(newDate);
  }
};

App.DateInput.prototype.onDayUpPressed = function(e) {
  e.preventDefault();
  var date = this.getFocusedCellDate();
  var newDate = this.getSameDayLastWeek(date);
  if(newDate.getMonth() == this.monthDate.getMonth()) {
    this.highlightCell(newDate);
  } else {
    this.monthDate = newDate;
    this.updateCalendarHtml(newDate.getFullYear(), newDate.getMonth());
    this.highlightCell(newDate);
  }
};

App.DateInput.prototype.onDayLeftPressed = function(e) {
  e.preventDefault();
  var date = this.getFocusedCellDate();
  var newDate = this.getPreviousDay(date);
  if(newDate.getMonth() == this.monthDate.getMonth()) {
    this.highlightCell(newDate);
  } else {
    this.monthDate = newDate;
    this.updateCalendarHtml(newDate.getFullYear(), newDate.getMonth());
    this.highlightCell(newDate);
  }
};

App.DateInput.prototype.onDayRightPressed = function(e) {
  e.preventDefault();
  var date = this.getFocusedCellDate();
  var newDate = this.getNextDay(date);
  if(newDate.getMonth() == this.monthDate.getMonth()) {
    this.highlightCell(newDate);
  } else {
    this.monthDate = newDate;
    this.updateCalendarHtml(newDate.getFullYear(), newDate.getMonth());
    this.highlightCell(newDate);
  }
};

App.DateInput.prototype.getPreviousDay = function(date) {
  var d = new Date(date);
  d.setDate(d.getDate()-1);
  return d;
};

App.DateInput.prototype.getSameDayLastWeek = function(date) {
  var d = new Date(date);
  d.setDate(d.getDate()-7);
  return d;
};

App.DateInput.prototype.getNextDay = function(date) {
  var d = new Date(date);
  d.setDate(d.getDate()+1);
  return d;
};

App.DateInput.prototype.getSameDayNextWeek = function(date) {
  var d = new Date(date);
  d.setDate(d.getDate()+7);
  return d;
};

App.DateInput.prototype.getDayCell = function(date) {
  return this.calendar.find('[data-date="'+date.toString()+'"]');
};

App.DateInput.prototype.updateCalendarHtml = function(year, month) {
  this.calendar.find('[role=status]').html(this.monthNames[month] + ' ' + year);
  this.calendar.find('select').html(this.getSelectOptionsHtml(year, month));
  this.calendar.find("tbody").html(this.getCalendarTableRows(month, year));
};

App.DateInput.prototype.updateInputValues = function(date) {
  this.dayInput.val(date.getDate())
  this.monthInput.val(date.getMonth()+1)
  this.yearInput.val(date.getFullYear())
};

App.DateInput.prototype.showPreviousMonth = function() {
  var pm = this.getPreviousMonth();
  this.monthDate = pm;
  this.updateCalendarHtml(pm.getFullYear(), pm.getMonth());
};

App.DateInput.prototype.showNextMonth = function() {
  var nm = this.getNextMonth();
  this.monthDate = nm;
  this.updateCalendarHtml(nm.getFullYear(), nm.getMonth());
};

App.DateInput.prototype.getPreviousMonth = function() {
  var dayInMs = 86400000;
  var d = new Date(this.monthDate.getFullYear(), this.monthDate.getMonth(),1);
  d = d.getTime() - dayInMs;
  d = new Date(d);
  d.setDate(1);
  return d;
};

App.DateInput.prototype.getNextMonth = function() {
  var d = new Date(this.monthDate.getFullYear(), this.monthDate.getMonth());
  d = d.setMonth(d.getMonth()+1);
  d = new Date(d);
  d.setDate(1);
  return d;
};

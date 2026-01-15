/**
 * Calendar rendering logic
 */

import {
  addDays,
  addMonths,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isBefore,
  isAfter,
  startOfDay,
  dateToString,
  formatMonthYear,
} from './utils.js';

export class CalendarRenderer {
  constructor(containerEl, options = {}) {
    this.containerEl = containerEl;
    this.today = startOfDay(new Date());
    this.maxDate = addMonths(this.today, options.advanceMonths || 12);
    this.currentMonth = this.findFirstAvailableMonth();
    this.selectedDate = null;
    this.onDateSelect = options.onDateSelect || (() => {});
  }

  findFirstAvailableMonth() {
    let month = startOfMonth(this.today);
    const maxMonth = startOfMonth(this.maxDate);

    while (month <= maxMonth) {
      const days = this.generateCalendarDays(month);
      const hasAvailableDay = days.some(day => day.isAvailable);

      if (hasAvailableDay) {
        return month;
      }

      month = addMonths(month, 1);
    }

    return startOfMonth(this.today);
  }

  generateCalendarDays(month) {
    const days = [];
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const startDayOfWeek = monthStart.getDay();

    // Previous month padding
    for (let i = 0; i < startDayOfWeek; i++) {
      const date = addDays(monthStart, -(startDayOfWeek - i));
      const isPast = isBefore(date, this.today);
      const isTooFar = isAfter(date, this.maxDate);

      days.push({
        date,
        isCurrentMonth: false,
        isAvailable: !isPast && !isTooFar,
        isPast,
        isToday: isSameDay(date, this.today),
      });
    }

    // Current month days
    let currentDate = monthStart;
    while (currentDate <= monthEnd) {
      const isPast = isBefore(currentDate, this.today);
      const isTooFar = isAfter(currentDate, this.maxDate);

      days.push({
        date: new Date(currentDate),
        isCurrentMonth: true,
        isAvailable: !isPast && !isTooFar,
        isPast,
        isToday: isSameDay(currentDate, this.today),
      });

      currentDate = addDays(currentDate, 1);
    }

    // Next month padding
    const endDayOfWeek = monthEnd.getDay();
    for (let i = endDayOfWeek + 1; i < 7; i++) {
      const date = addDays(monthEnd, i - endDayOfWeek);
      const isPast = isBefore(date, this.today);
      const isTooFar = isAfter(date, this.maxDate);

      days.push({
        date,
        isCurrentMonth: false,
        isAvailable: !isPast && !isTooFar,
        isPast,
        isToday: isSameDay(date, this.today),
      });
    }

    return days;
  }

  render() {
    const days = this.generateCalendarDays(this.currentMonth);
    const html = days
      .map(day => {
        const classes = ['calendar-day'];

        if (day.isAvailable) classes.push('available');
        if (day.isPast || !day.isAvailable) classes.push('unavailable');
        if (!day.isCurrentMonth) classes.push('other-month');
        if (day.isToday) classes.push('today');
        if (this.selectedDate && isSameDay(day.date, this.selectedDate)) {
          classes.push('selected');
        }

        const dateStr = dateToString(day.date);

        return `
          <div
            class="${classes.join(' ')}"
            data-date="${dateStr}"
            ${day.isAvailable ? '' : 'disabled'}
          >
            ${day.date.getDate()}
          </div>
        `;
      })
      .join('');

    this.containerEl.innerHTML = html;
    this.attachEventListeners();
  }

  attachEventListeners() {
    this.containerEl.querySelectorAll('.calendar-day.available').forEach(dayEl => {
      dayEl.addEventListener('click', () => {
        const dateStr = dayEl.dataset.date;
        const [year, month, day] = dateStr.split('-').map(Number);
        this.selectedDate = new Date(year, month - 1, day);
        this.render(); // Re-render to show selection
        this.onDateSelect(this.selectedDate);
      });
    });
  }

  nextMonth() {
    const next = addMonths(this.currentMonth, 1);
    if (!isAfter(next, startOfMonth(this.maxDate))) {
      this.currentMonth = next;
      this.render();
      return true;
    }
    return false;
  }

  prevMonth() {
    const prev = addMonths(this.currentMonth, -1);
    if (!isBefore(prev, startOfMonth(this.today))) {
      this.currentMonth = prev;
      this.render();
      return true;
    }
    return false;
  }

  goToMonth(month) {
    this.currentMonth = month;
    this.render();
  }

  getCurrentMonth() {
    return this.currentMonth;
  }

  getAvailableMonths() {
    const months = [];
    let month = startOfMonth(this.today);
    const maxMonth = startOfMonth(this.maxDate);

    while (month <= maxMonth) {
      months.push(new Date(month));
      month = addMonths(month, 1);
    }

    return months;
  }

  getSelectedDate() {
    return this.selectedDate;
  }
}

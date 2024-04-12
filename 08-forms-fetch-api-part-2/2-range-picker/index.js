export default class RangePicker {
  constructor({ from = newDate(), to = newDate() } = {}) {
    this.from = from;
    this.to = to;
    this.fromStr = from.toISOString();
    this.toStr = to.toISOString();

    this.initialYear = new Date(from).getFullYear();
    this.initialMonth = new Date(from).getMonth() + 1;

    this.renderCalendar();
    this.attachEventListeners();
    this.clickCounter = 0;
    this.selectedRange = [];
  }

  renderCalendar() {
    this.element = this.createElement(this.createTemplate());
  }

  createElement(template) {
    const element = document.createElement("div");
    element.innerHTML = template;
    return element.firstElementChild;
  }

  createTemplate() {
    return `
      <div class="rangepicker">
        <div class="rangepicker__input" data-element="input">
          <span data-element="from">${this.inputDateFormat(this.from)}</span> -
          <span data-element="to">${this.inputDateFormat(this.to)}</span>
        </div>
        <div class="rangepicker__selector" data-element="selector"></div>
      </div>
    `;
  }

  createSelectorTemplate(year, month) {
    return `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      ${this.createCalendarTemplate(year, month)}
      ${this.createCalendarTemplate(year, month + 1)}
    `;
  }

  inputDateFormat(date) {
    return date.toLocaleString("ru", { dateStyle: "short" });
  }

  createCalendarTemplate(year, month) {
    const calendar = this.generateButtons(year, month);

    return `
      <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
        <time datetime="${this.getMonthName(
      year,
      month,
      "en-US"
    )}">${this.getMonthName(year, month, "ru-RU")}
        </time>
        </div>
        <div class="rangepicker__day-of-week">
          <div>Пн</div>
          <div>Вт</div>
          <div>Ср</div>
          <div>Чт</div>
          <div>Пт</div>
          <div>Сб</div>
          <div>Вс</div>
        </div>
        <div class="rangepicker__date-grid">
          ${calendar}
        </div>
      </div>
    `;
  }

  getMonthName(year, month, lang) {
    const date = new Date(year, month - 1, 1);
    return date.toLocaleString(lang, { month: "long" });
  }

  generateButtons(year, month) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const date = new Date(year, month - 1, 1);
    const dayIndex = date.getDay();

    let buttonArr = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day);
      const isoDateString = currentDate.toISOString();
      const startDate = isoDateString === this.fromStr;
      const endDate = isoDateString === this.toStr;
      const betweenDate =
        this.fromStr <= isoDateString && isoDateString <= this.toStr;

      const highlight = startDate
        ? "rangepicker__cell rangepicker__selected-from"
        : endDate
          ? "rangepicker__cell rangepicker__selected-to"
          : betweenDate
            ? "rangepicker__cell rangepicker__selected-between"
            : "rangepicker__cell";

      let buttonElement = `<button type="button" class="${highlight}" data-value="${isoDateString}">${day}</button>`;

      if (day === 1) {
        buttonElement = `<button type="button" class="${highlight}" data-value="${isoDateString}" style="--start-from:${dayIndex}">${day}</button>`;
      }

      buttonArr.push(buttonElement);
    }
    return buttonArr.join("");
  }

  attachEventListeners() {
    this.rangePickerInput = this.element.querySelector(".rangepicker__input");
    this.calendarSelector = this.element.querySelector(
      '[data-element="selector"]'
    );
    this.rangePickerInput.addEventListener("click", this.handleRangePickerClick);
    this.calendarSelector.addEventListener("click", this.handleDateSelectorClick);
    this.calendarSelector.addEventListener("click", this.handleLeftControlClick);
    this.calendarSelector.addEventListener("click", this.handleRightControlClick);
  }

  removeEventListeners() {
    this.rangePickerInput.removeEventListener("click", this.handleRangePickerClick);
    this.calendarSelector.removeEventListener("click", this.handleDateSelectorClick);
    this.calendarSelector.removeEventListener("click", this.handleLeftControlClick);
    this.calendarSelector.removeEventListener("click", this.handleRightControlClick);
  }

  handleRangePickerClick = () => {
    this.calendarSelector.innerHTML = this.createSelectorTemplate(
      this.initialYear,
      this.initialMonth
    );
    this.element.classList.toggle("rangepicker_open");
  };

  handleRightControlClick = (event) => {
    const rightControl = event.target.closest(
      ".rangepicker__selector-control-right"
    );
    if (event.target != rightControl) return;

    this.initialMonth++;
    if (this.initialMonth > 12) {
      this.initialMonth = 1;
      this.initialYear++;
    }
    this.updateDateButtons(this.initialYear, this.initialMonth);
  };

  handleLeftControlClick = (event) => {
    const leftControl = event.target.closest(
      ".rangepicker__selector-control-left"
    );
    if (event.target != leftControl) return;
    this.initialMonth--;
    if (this.initialMonth < 1) {
      this.initialMonth = 12;
      this.initialYear--;
    }
    this.updateDateButtons(this.initialYear, this.initialMonth);
  };

  handleDateSelectorClick = (event) => {
    const buttonElement = event.target.closest(".rangepicker__cell");
    if (event.target != buttonElement) return;

    const newDate = new Date(buttonElement.dataset.value);

    const inputFrom = this.element.querySelector('[data-element="from"]');
    const inputTo = this.element.querySelector('[data-element="to"]');

    switch (this.clickCounter) {
      case 0:
        this.selectedRange = [];
        this.selectedRange.push(newDate);
        this.clickCounter++;
        this.cleanSelection(buttonElement);
        break;
      case 1:
        if (newDate > this.selectedRange[0]) {
          this.selectedRange.push(newDate);
        } else {
          this.selectedRange.unshift(newDate);
        }
        this.selectedRange.push(newDate);
        this.clickCounter = 0;
        this.setSelection(buttonElement, this.selectedRange);
        this.fromStr = this.selectedRange[0].toISOString();
        this.toStr = this.selectedRange[1].toISOString();
        inputFrom.textContent = this.inputDateFormat(this.selectedRange[0]);
        inputTo.textContent = this.inputDateFormat(this.selectedRange[1]);
        break;
    }
  };

  updateDateButtons(year, month) {
    const monthName = document.querySelectorAll("[datetime]");
    monthName.forEach((element, idx) => {
      element.innerHTML = this.getMonthName(year, month + idx, "ru-RU");
      element.setAttribute(
        "datetime",
        this.getMonthName(year, month + idx, "en-US")
      );
    });

    const calendars = Array.from(
      document.getElementsByClassName("rangepicker__date-grid")
    );

    if (calendars.length === 2) {
      const cal1 = this.generateButtons(year, month);
      const cal2 = this.generateButtons(year, month + 1);
      calendars[0].innerHTML = cal1;
      calendars[1].innerHTML = cal2;
    }
  }

  cleanSelection(selected) {
    const from = this.element.querySelector(".rangepicker__selected-from");
    const to = this.element.querySelector(".rangepicker__selected-to");
    const betweenElements = Array.from(
      document.getElementsByClassName("rangepicker__selected-between")
    );
    from?.classList.remove("rangepicker__selected-from");
    to?.classList.remove("rangepicker__selected-to");
    betweenElements?.forEach((element) => {
      element.classList.remove("rangepicker__selected-between");
    });
    selected.classList.add("rangepicker__selected-from");
  }

  setSelection(selected, range) {
    selected.classList.add("rangepicker__selected-to");
    const elements = document.querySelectorAll(
      ".rangepicker__cell[data-value]"
    );
    const startDate = range[0];
    const endDate = range[1];

    Array.from(elements).forEach((element) => {
      const buttonDate = new Date(element.getAttribute("data-value"));
      if (buttonDate > startDate && buttonDate < endDate) {
        element.classList.add("rangepicker__selected-between");
      }
    });
  }

  destroy = () => {
    this.remove();
  };

  remove = () => {
    this.element.remove();
    this.removeEventListeners();
  };
}

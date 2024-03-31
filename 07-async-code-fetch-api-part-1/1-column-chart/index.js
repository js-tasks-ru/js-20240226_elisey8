import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  element = null;
  data = []
  subElements = {}
  coefficent = null

  constructor(options = {}) {
    const {
      url = "",
      value = "",
      link = "",
      label = "",
      formatHeading,
      chartHeight = 50
    } = options;
    this.url = url;
    this.label = label;
    this.value = value;
    this.link = link;
    this.chartHeight = chartHeight;
    this.formatHeading = formatHeading;
    this.initialize();
  }

  async update(from = new Date(), to = new Date()) {
    this.element.className = "column-chart_loading";
    const params = new URLSearchParams({
      from: from.toISOString(),
      to: to.toISOString(),
    });
    const data = await fetch(`${BACKEND_URL}/${this.url}?` + params);
    const res = await data.json();
    this.element.className = "column-chart";
    this.data = Object.values(res);
    this.element.dispatchEvent(new CustomEvent("update-chart", { bubbles: true }));
    return res;
  }

  initialize() {
    document.addEventListener("update-chart", this.updateElement);
    const chartElement = document.createElement("div");
    chartElement.innerHTML = this.template.trim();
    this.element = chartElement.firstChild;
    this.initializeSubElements();
    this.update();
  }

  render = (container) => {
    container.append(this.element);
  }

  updateElement = () => {
    this.subElements.body.innerHTML = this.createChartTemplate();
  }

  initializeSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    elements.forEach(element => this.subElements[element.dataset.element] = element);
  }

  get template() {
    return `
        <div data-element="chart" class="column-chart" style="--chart-height: ${this.chartHeight}">
          <div class="column-chart__title">
            ${this.label}
            <a href=${this.link} class="column-chart__link">View all</a>
          </div>
          <div data-element="container" class="column-chart__container">
            <div data-element="header" class="column-chart__header">${this.value}</div>
            <div data-element="body" class="column-chart__chart">
              ${this.createChartTemplate()}
            </div>
          </div>
        </div>
      `;
  }

  createChartTemplate() {
    return this.data
      .map((value) =>
        `<div
              style="--value: ${this.getColumnValue(value)}"
              data-tooltip=${this.getColumnPercent(value)}
            ></div>`
      ).join("");
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener("update-chart", this.updateElement);
    this.element = null;
  }

  getColumnValue(value) {
    if (!this.coefficent) {
      this.coefficent = Math.max(...this.data) / this.chartHeight;
    }
    return Math.floor(value / this.coefficent);
  }

  getColumnPercent(value) {
    return (value / Math.max(...this.data) * 100).toFixed(0) + '%';
  }
}

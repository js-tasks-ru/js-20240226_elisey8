export default class ColumnChart {
  chartHeight = 50;

  element;
  subElements = {};

  constructor(props = {}) {
    const {
      data,
      label = '',
      link = '',
      value = 0,
      formatHeading = '',
    } = props;

    this.data = data;
    this.label = label;
    this.link = link;
    this.value = formatHeading ? formatHeading(value) : value;

    this.render();
  }

  render() {
    this.element = this.createElement(this.createTemplate(this));

    this.subElements = {
      body: this.element.querySelector('[data-element="body"]')
    };
  }

  createElement(template) {
    const element = document.createElement("div");

    element.innerHTML = template;

    return element.firstElementChild;
  }

  createTemplate(props) {
    return `
      <div class="column-chart ${this.data ? '' : 'column-chart_loading'}" style="--chart-height: ${props.chartHeight}">
        <div class="column-chart__title">
          ${props.label}
          ${props.link ? `<a class="column-chart__link" href="${props.link}">View all</a>` : ""}
        </div>
        <div class="column-chart__container">
          <div class="column-chart__header" data-element="header">${this.value}</div>
          <div class="column-chart__chart${this.data ? ' column-chart_loading' : ''}" data-element="body">
            ${this.createColumnChartBodyTemplate()}
          </div>
        </div>
      </div>
    `;
  }

  createColumnChartBodyTemplate() {
    return `
      ${this.data ? '' : '<image src="charts-skeleton.svg">'}
      ${this.data ? this.createColumnPropsTemplate() : ""}
    `;
  }

  createColumnPropsTemplate() {
    const maxValue = Math.max(...this.data);
    return this.data.map(item => {
      return `
        <div
          style="--value: ${String(Math.floor(item * this.chartHeight / maxValue))}"
          data-tooltip = ${(item / maxValue * 100).toFixed(0) + '%'}>
        </div>`;
    }).join("");
  }

  update(newData) {
    this.data = newData;
    this.subElements.body.innerHTML = this.createColumnChartBodyTemplate();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

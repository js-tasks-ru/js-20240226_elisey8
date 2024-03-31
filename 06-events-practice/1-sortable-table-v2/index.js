export default class SortableTable {
  element = null
  root = null
  subElements = null
  constructor(headersConfig, {
    data = [],
    sorted = {
      id: "title",
      order: "asc"
    }
  } = {}) {
    this.headerConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.render();

  }

  render() {
    const headerElement = this.createHeader(this.headerConfig);
    const tableElement = this.createTableBody(this.data);
    this.element = this.createRootElement(headerElement, tableElement);

    const { id, order } = this.sorted;
    this.sort(id, order);

    this.subElements = {
      body: this.element.firstElementChild.children[1],
      header: this.element.firstElementChild.children[0]
    };
    this.addListeners();
  }

  update() {

    if (!this.root) {
      this.root = this.element.parentNode;
    }
    const tableBodyElement = this.element.querySelector('[data-element="body"]');

    tableBodyElement.innerHTML = this.createTableBody(this.data);
  }

  addListeners() {
    const headerElement = this.element.querySelector('[data-element="header"]');
    headerElement.addEventListener("click", this.handleSort.bind(this));
  }

  handleSort(event) {
    const targetElement = event.target.closest("div");
    const orderDirection = targetElement.dataset.order === "asc" ? "desc" : "asc";
    const fieldName = targetElement.dataset.id;
    targetElement.dataset.order = orderDirection;
    this.sort(fieldName, orderDirection);
  }

  createRootElement(header, table) {
    const template = `
      <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">
        ${header}
        ${table}
      </div>
      </div>
    `;
    const rootElement = document.createElement('template');
    rootElement.innerHTML = template.trim();
    return rootElement.content.firstChild;
  }

  createHeader(headerConfig) {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${headerConfig.map(item => `
            <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-order="asc">
            <span>${item.title}</span>
            ${item.sortable
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
                  <span class="sort-arrow"></span>
                </span>`
      : ""}
          </div>
            `
    ).join(' ')}
      </div>
    `;
  }

  createTableBody(data) {
    return `
      <div data-element="body" class="sortable-table__body">
          ${data.map(item => this.createTableRow(item)).join(" ")}
      </div>
    `;
  }

  createTableRow(item) {
    return (
      `
            <a href="/products/${item.id}" class="sortable-table__row">
              ${this.headerConfig.map(({ id, template }) => (
        template
          ? template(item[id])
          : `<div class='sortable-table__cell'>${item[id]}</div>`
      )).join('')}
              <div class="sortable-table__cell">${item.title}</div>

              <div class="sortable-table__cell">${item.quantity}</div>
              <div class="sortable-table__cell">${item.price}</div>
              <div class="sortable-table__cell">${item.sales}</div>
            </a>
          `
    );
  }

  sort(fieldValue, orderValue) {
    const isSortable = this.headerConfig.find(item => item.id === fieldValue).sortable;
    if (!isSortable) {return;}
    const sortType = this.headerConfig.find(item => item.id === fieldValue).sortType;
    const sortAscending = (a, b) => a[fieldValue] - b[fieldValue];
    const sortDescending = (a, b) => b[fieldValue] - a[fieldValue];
    const sortStringAscending = (a, b) => a[fieldValue].localeCompare(b[fieldValue], "ru");
    const sortStringDescending = (a, b) => b[fieldValue].localeCompare(a[fieldValue], "ru");

    if (sortType === "number") {
      this.data.sort(orderValue === "asc" ? sortAscending : sortDescending);
    } else {
      this.data.sort(orderValue === "asc" ? sortStringAscending : sortStringDescending);
    }
    this.update();
  }

  destroy() {
    this.element = null;
  }

  remove() {
    this.destroy();
  }
}

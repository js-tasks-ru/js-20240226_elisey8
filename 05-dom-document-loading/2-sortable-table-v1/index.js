export default class SortableTable {

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.element = this.createElement(this.createBodyTemplate());

    this.subElements = {
      body: this.element.querySelector('[data-element="body"]'),
      header: this.element.querySelector('[data-element="header"]')
    };
  }

  createElement(template) {
    const element = document.createElement("div");

    element.innerHTML = `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
	    ${this.createHeaderTemplate()}
	    ${template}
        </div>
      </div>
  	`;
    return element.firstElementChild;
  }

  createHeaderTemplate() {
    return `
	    <div data-element="header" class="sortable-table__header sortable-table__row">
         ${this.createHeaderTableTemplate()}
        </div>
	  `;
  }

  createBodyTemplate() {
    return `
      <div data-element="body" class="sortable-table__body">
       ${this.createBodyTableTemplate()}
      </div>
      <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
           <p>No products satisfies your filter criteria</p>
           <button type="button" class="button-primary-outline">Reset all filters</button>
          </div>
        </div>
    `;
  }

  createArrowTemplate() {
    return `
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      `;
  }

  createHeaderTableTemplate() {
    return this.headerConfig.map((item) => {

      item.id.includes('title')
        ? this.arrow = this.createArrowTemplate()
        : this.arrow = "";

      return `
         <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" 'data-order="asc"'>
          <span>${item.title}</span>
          ${this.arrow}
        </div>
     `;
    }).join('');
  }

  createBodyTableTemplate() {
    return this.data.map((item) => `
        <a href="/products/3d-ochki-epson-elpgs03" class="sortable-table__row">
          ${this.createRowTableTemplate(item)}
        </a>
      `).join('');
  }

  createRowTableTemplate(item) {
    return this.headerConfig.map((headerItem, n) => {
        return `
          <div class="sortable-table__cell">${item[this.headerConfig[n].id]}</div>
	      `;
      }
    ).join('');
  }

  sortStringsAscending(arr) {
    const arrCopy = [...arr];
    arrCopy.sort((a, b) =>
      a.title.localeCompare(b.title, ["ru", "en"], {caseFirst: "upper"})
    );
    return arrCopy;
  }

  sortStringsDescending(arr) {
    const arrCopy = [...arr];
    arrCopy.sort((a, b) =>
      b.title.localeCompare(a.title, ["ru", "en"], {caseFirst: "upper"})
    );
    return arrCopy;
  }

  sortedByTitle(data, param = "asc") {
    const asc = this.sortStringsAscending(data);
    const desc = this.sortStringsDescending(data);
    return param === "desc" ? desc : asc;
  }

  sortedByNumbers(data, param = "asc", fieldValue) {
    const asc = data.slice().sort((a, b) => a[fieldValue] - b[fieldValue]);
    const desc = data.slice().sort((a, b) => b[fieldValue] - a[fieldValue]);
    return param === "desc" ? desc : asc;
  }

  sort(fieldValue, orderValue) {
    const newData =
      typeof this.data[0][fieldValue] === "string"
        ? this.sortedByTitle(this.data, orderValue)
        : this.sortedByNumbers(this.data, orderValue, fieldValue);

    this.data = newData;
    this.update(newData);
  }

  update(newData) {
    this.data = newData;
    this.subElements.body.innerHTML = this.createBodyTableTemplate();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

}


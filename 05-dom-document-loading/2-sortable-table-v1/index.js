export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.element = this.createElement(this.createTemplate(this.data));
    this.parent = document.querySelector("#root");
  }
  createElement(template) {
    const element = document.createElement("div");
    element.innerHTML = template;
    return element.firstElementChild;
  }
  createTemplate(data, orderValue, fieldValue) {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div  class="sortable-table">
          ${this.createHeaderTemplate(
      this.headerConfig,
      orderValue,
      fieldValue
    )}
          <div data-element="body" class="sortable-table__body">
            ${this.createBodyTemplate(data)}
          </div>
          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        </div>
      </div>
    `;
  }
  createBodyTemplate(data) {
    return data
      .map((item) => {
        const { images, title, quantity, price, sales, status, id } = item;
        return this.createItemTemplate(
          images?.[0]?.url,
          title,
          quantity,
          price,
          sales,
          status,
          id
        );
      })
      .join("");
  }

  createItemTemplate(image, title, quantity, price, sales, status, link) {
    return `
      <a href="/products/${link}" class="sortable-table__row">
        ${
      image
        ? `<div class="sortable-table__cell"><img class="sortable-table-image" alt="Image" ></div>`
        : ""
    }
      ${title ? `<div class="sortable-table__cell">${title}</div>` : ""}
      ${quantity ? `<div class="sortable-table__cell">${quantity}</div>` : ""}
      ${price ? `<div class="sortable-table__cell">${price}</div>` : ""}
      ${sales ? `<div class="sortable-table__cell">${sales}</div>` : ""}
      ${!sales ? `<div class="sortable-table__cell">${status || 0}</div>` : ""}
      </a>
    `;
  }
  createHeaderTemplate(headerData, orderValue, fieldValue) {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${headerData
      .map((item) => {
        const { id, sortable, title } = item;
        const order = fieldValue === id ? orderValue : "";
        return `
              <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
                <span>${title}</span>
                ${
          sortable
            ? `<span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>`
            : ""
        }
              </div>
            `;
      })
      .join("")}
      </div>
    `;
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
      fieldValue === "title"
        ? this.sortedByTitle(this.data, orderValue)
        : this.sortedByNumbers(this.data, orderValue, fieldValue);
    this.data = newData;
    this.updateBody(this.subElements.body, newData);
  }
  updateBody(bodyElement, newData) {
    const newBody = this.createBodyTemplate(newData);
    bodyElement.innerHTML = newBody;
  }
  destroy() {
    this.element.remove();
  }
  get subElements() {
    return {
      body: this.element.querySelector('[data-element="body"]'),
      header: this.element.querySelector('[data-element="header"]'),
    };
  }
}

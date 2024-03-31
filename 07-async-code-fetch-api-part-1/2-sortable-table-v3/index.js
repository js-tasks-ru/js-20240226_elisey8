import SortableTableV2 from '../../06-events-practice/1-sortable-table-v2/index.js';

const BACKEND_URL = 'https://course-js.javascript.ru';
const defaultSorted = (headerConfig) => ({
  id: headerConfig.find(item => item.sortable).id,
  order: 'asc'
});

export default class SortableTable extends SortableTableV2 {
  element = null
  subElements = {}

  constructor(headersConfig, {
    isSortLocally = false,
    url = "",
    data = [],
    sorted = {}
  } = {}) {
    super(headersConfig, { data, sorted: defaultSorted(headersConfig) });
    this.headerConfig = headersConfig;
    this.isSortLocally = isSortLocally;
    this.sorted = sorted;
    this.url = url;
    this.data = data;
    this.initialize();
  }

  initialize() {
    const headerElement = super.createHeader(this.headerConfig);
    const tableElement = super.createTableBody(this.data);
    this.element = super.createRootElement(headerElement, tableElement);
    this.initializeSubElements();
    this.render();
    this.addListeners();
  }

  async render() {
    this.subElements.body.innerHTML = "loading...";
    const data = await this.getTableData({
      sort: this.sorted.id,
      order: this.sorted.order,
    });
    this.data = data;
    this.updateTable(data);
  }

  addListeners() {
    this.subElements.header.addEventListener("pointerdown", this.handleSort);
  }

  updateTable(data) {
    this.subElements.body.innerHTML = data.map(item => super.createTableRow(item)).join("");
  }

  async getTableData({
                       sort,
                       order,
                       start = 0,
                       end = 30
                     }) {
    const params = new URLSearchParams({
      _sort: sort,
      _order: order,
      _start: start,
      _end: end,
    });

    const data = await fetch(`${BACKEND_URL}/${this.url}?` + params);
    return await data.json();
  }

  initializeSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    elements.forEach(element => this.subElements[element.dataset.element] = element);
  }

  handleSort = (event) => {
    const targetElement = event.target.closest("div");
    const orderDirection = targetElement.dataset.order === "asc" ? "desc" : "asc";
    const fieldName = targetElement.dataset.id;
    targetElement.dataset.order = orderDirection;
    const sort = this.isSortLocally ? this.sortOnClient : this.sortOnServer;
    sort(fieldName, orderDirection);
  }

  sortOnClient = (fieldValue, orderValue) => {
    const isSortable = this.headerConfig.find(item => item.id === fieldValue)?.sortable;
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
    this.updateTable(this.data);
  }

  sortOnServer = async (id, order) => {
    this.subElements.body.innerHTML = "loading...";
    const data = await this.getTableData({
      sort: id,
      order,
    });
    this.data = data;
    this.updateTable(data);
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
  }
}

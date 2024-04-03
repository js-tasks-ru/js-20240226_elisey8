import SortableTableV2 from "../../06-events-practice/1-sortable-table-v2/index.js";
import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class SortableTable extends SortableTableV2 {
  constructor(
    headersConfig,
    {
      data = [],
      sorted = { id: "title", order: "asc" },
      url = "",
      isSortLocally = false,
    } = {}
  ) {
    super(headersConfig, data);
    this.url = url;
    this.isSortLocally = isSortLocally;
    this.table = this.element.querySelector(`.sortable-table`);
    this.sorted = sorted;
    this.render(sorted.id, sorted.order);
    super.sort(sorted.id, sorted.order);
    this.headerEl.removeEventListener("pointerdown", this.onHeaderClick);
    this.headerEl.addEventListener("pointerdown", this.sortOnClick);
    window.addEventListener("scroll", this.loadDataOnScroll);
  }

  async render(id, order) {
    this.table.classList.add("sortable-table_loading"); // add progres bar

    const url = `${BACKEND_URL}/${this.url}?_sort=${id}&_order=${order}&_start=0&_end=30`;
    try {
      const data = await fetchJson(url);
      super.sort(id, order);
      super.updateBody(this.subElements.body, data);
      this.data = data;
      return data;
    } catch (err) {
      console.log("Error:", err);
    } finally {
      this.table.classList.remove("sortable-table_loading"); //remove progress bar
    }
  }

  sortOnClick = (event) => {
    const headerCell = event.target.closest(
      '.sortable-table__cell[data-sortable="true"]'
    );

    if (headerCell) {
      const field = headerCell.dataset.id;
      const currentOrder = headerCell.getAttribute("data-order") || "asc";
      const newOrder = currentOrder === "asc" ? "desc" : "asc";
      headerCell.setAttribute("data-order", newOrder);
      this.sort(field, newOrder);
      this.sorted.id = field;
      this.sorted.order = newOrder;
    }
  };

  sort(fieldValue, orderValue) {
    if (this.isSortLocally) {
      this.sortOnClient(fieldValue, orderValue);
    } else {
      this.sortOnServer(fieldValue, orderValue);
    }
  }

  sortOnClient(id, order) {
    const newData =
      id === "title"
        ? this.sortedByTitle(this.data, order)
        : this.sortedByNumbers(this.data, order, id);

    this.data = newData;
    this.updateBody(this.subElements.body, newData);
  }

  sortOnServer(fieldValue, orderValue) {
    this.render(fieldValue, orderValue);
  }

  loadDataOnScroll = async () => {
    if (this.isSortLocally) return;

    const { bottom } = this.table?.getBoundingClientRect();

    if (bottom <= window.innerHeight + 100) {
      console.log("Load more data...");
      await this.loadMoreData();
    }
  };

  async loadMoreData() {
    const url = `${BACKEND_URL}/${this.url}?_sort=${this.sorted.id}&_order=${
      this.sorted.order
    }&_start=${this.data.length}&_end=${this.data.length + 30}`;

    try {
      const newData = await fetchJson(url);
      this.data = [...this.data, ...newData];
      this.updateBody(this.subElements.body, this.data);
    } catch (err) {
      console.log("Error:", err);
    }
  }

  destroy() {
    super.destroy();
    this.headerEl.removeEventListener("pointerdown", this.sortOnClick);
    window.removeEventListener("scroll", this.onWindowScroll);
  }
}

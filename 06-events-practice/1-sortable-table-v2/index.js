import Table from "../../05-dom-document-loading/2-sortable-table-v1/index.js";

export default class SortableTable extends Table {
  constructor(headersConfig, {data = [], sorted = {}} = {}) {
    super(headersConfig, data);

    this.domContentLoadedListener = () => {
      this.setCurrentCell(sorted);
      super.sort(sorted.id, sorted.order);
    };
    this.initHeaderListeners();
    document.addEventListener(
      "DOMContentLoaded",
      this.domContentLoadedListener
    );
  }

  setCurrentCell(sorted) {
    const headerCell = document.querySelector(
      `.sortable-table__cell[data-id="${sorted.id}"]`
    );
    if (headerCell) {
      headerCell.setAttribute("data-order", sorted.order);
    }
  }

  onHeaderClick = (event) => {
    const headerCell = event.target.closest(
      '.sortable-table__cell[data-sortable="true"]'
    );

    if (headerCell) {
      const field = headerCell.dataset.id;
      const currentOrder = headerCell.getAttribute("data-order") || "asc";
      const newOrder = currentOrder === "asc" ? "desc" : "asc";
      headerCell.setAttribute("data-order", newOrder);
      super.sort(field, newOrder);
    }
  };

  initHeaderListeners() {
    if (!this.headerEl) {
      return;
    }
    this.headerEl.addEventListener("pointerdown", this.onHeaderClick);
  }

  destroy() {
    super.destroy();
    this.headerEl.removeEventListener("pointerdown", this.onHeaderClick);
    document.removeEventListener(
      "DOMContentLoaded",
      this.domContentLoadedListener
    );
  }

  get headerEl() {
    return this.subElements.header;
  }
}

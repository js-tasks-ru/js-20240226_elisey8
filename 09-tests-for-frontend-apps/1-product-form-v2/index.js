import SortableList from "../2-sortable-list/index.js";
import ProductFormV1 from "./../../08-forms-fetch-api-part-2/1-product-form-v1/index.js";
import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class ProductForm extends ProductFormV1 {
  constructor(productId) {
    super();
    this.productId = productId;
  }

  async render() {
    await super.render();
    const productUrl = `${BACKEND_URL}/api/rest/products?id=${this.productId}`;
    try {
      const productData = await fetchJson(productUrl);
      const sortableListContainer = this.element.querySelector(
        '[data-element="imageListContainer"]'
      );
      sortableListContainer.innerHTML = "";
      const sortableList = new SortableList({
        items: this.createImages(productData[0]),
      });
      sortableListContainer.appendChild(sortableList.element);
    } catch (err) {
      console.log("Error:", err);
    }

    return this.element;
  }
}

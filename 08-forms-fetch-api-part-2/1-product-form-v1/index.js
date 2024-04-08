import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  constructor (productId) {
    this.productId = productId;

    this.element = this.createElement(this.createTemplate());

    this.subElements = {
      title: this.element.querySelector('[name="title"]'),
      description: this.element.querySelector('[name="description"]'),
      quantity: this.element.querySelector('[name="quantity"]'),
      subcategory: this.element.querySelector('[name="subcategory"]'),
      status: this.element.querySelector('[name="status"]'),
      price: this.element.querySelector('[name="price"]'),
      discount: this.element.querySelector('[name="discount"]'),
      productForm: this.element.querySelector(`[data-element="productForm"]`),
      imageListContainer: this.element.querySelector(
        `[data-element="imageListContainer"]`
      ),
    };
  }

  createElement(template) {
    const element = document.createElement("div");
    element.innerHTML = template;
    return element.firstElementChild;
  }

  createTemplate() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required="" type="text" id="title" name="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" id="description" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer"></div>
            <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select class="form-control" id="subcategory" name="subcategory"></select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required="" type="number" id="price" name="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required="" type="number" id="discount" name="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required="" type="number" class="form-control" id="quantity" name="quantity" placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" id="status" name="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>
        </form>
      </div>
    `;
  }

  async render() {
    const categoryUrl = `${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`;
    const productUrl = `${BACKEND_URL}/api/rest/products?id=${this.productId}`;

    try {
      const [categoryData, productData] = await Promise.all([
        fetchJson(categoryUrl),
        fetchJson(productUrl),
      ]);
      this.createItemData(productData[0]);
      this.subElements.subcategory.innerHTML = this.createCategoryTemplate(
        categoryData,
        productData[0].subcategory
      );

      return this.element;
    } catch (err) {
      console.log("Error:", err);
    }
  }

  createItemData(data) {
    if (!data) return;

    const {
      title,
      description,
      quantity,
      subcategory,
      status,
      price,
      discount,
      imageListContainer,
    } = this.subElements;

    title.value = data.title;
    description.value = data.description;
    quantity.value = data.quantity;
    subcategory.value = data.subcategory;
    status.value = data.status;
    price.value = data.price;
    discount.value = data.discount;
    imageListContainer.append(...this.createImages(data));
  }

  createImages(data) {
    return data.images.map((image) => {
      return this.createImageItemTemplate(image);
    });
  }

  createImageItemTemplate(image) {
    const imageItem = document.createElement("li");
    imageItem.classList.add(
      "products-edit__imagelist-item",
      "sortable-list__item"
    );
    imageItem.classList.add("this");
    imageItem.innerHTML = `
      <input type="hidden" name="url" value="${escapeHtml(image.url)}">
      <input type="hidden" name="source" value="${escapeHtml(image.source)}">
      <span>
        <img src="icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="${escapeHtml(
      image.url
    )}">
        <span>${escapeHtml(image.source)}</span>
      </span>
      <button type="button">
        <img src="icon-trash.svg" data-delete-handle="" alt="delete">
      </button>
    `;
    return imageItem;
  }

  createCategoryTemplate(data, selectedValue) {
    if (!data) return "";

    return data
      .map((category) => {
        const options = category.subcategories
          .map((child) => {
            const isSelected = child.id === selectedValue ? "selected" : "";
            return `<option value=${child.id} ${isSelected}>
                  ${escapeHtml(category.title)} &gt; ${escapeHtml(child.title)}
                </option>`;
          })
          .join("");

        return options;
      })
      .join("");
  }

  async save() {
    const productUpdatedEvent = new CustomEvent("product-updated", {
      bubbles: true,
    });

    const productSavedEvent = new CustomEvent("product-saved", {
      bubbles: true,
    });

    if (this.productId) {
      this.element.dispatchEvent(productUpdatedEvent);
    } else {
      this.element.dispatchEvent(productSavedEvent);
    }
  }

  destroy = () => {
    this.remove();
  };

  remove = () => {
    this.element.remove();
  };
}

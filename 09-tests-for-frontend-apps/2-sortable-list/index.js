export default class SortableList {
  constructor({ items = {} }) {
    this.element = this.createListElement("ul");
    this.setItems(items);
    this.attachEventListeners();
  }

  createListElement(tagName) {
    const element = document.createElement(tagName);
    element.classList.add("sortable-list");
    return element;
  }

  setItems(items) {
    this.element.innerHTML = items
      .map((item) => {
        item.classList.add("sortable-list__item");
        return item.outerHTML;
      })
      .join("");
  }

  attachEventListeners() {
    document.addEventListener("pointerdown", this.onElementDelete);
    document.addEventListener("pointerdown", this.onElementDrag);
  }

  detachEventListeners() {
    document.removeEventListener("pointerdown", this.onElementDelete);
    document.removeEventListener("pointerdown", this.onElementDrag);
  }

  onElementDelete(event) {
    const item = event.target.closest(".sortable-list__item");
    const deleteButton = event.target.closest("[data-delete-handle]");
    if (event.target != deleteButton) return;
    item.remove();
  }

  onElementDrag = (event) => {
    const item = event.target.closest(".sortable-list__item");
    const dragButton = event.target.closest("[data-grab-handle]");

    if (event.target !== dragButton) return;

    const shiftX = event.clientX - item.getBoundingClientRect().left;
    const shiftY = event.clientY - item.getBoundingClientRect().top;

    const placeholder = this.createPlaceholder(item);
    this.insertPlaceholder(item, placeholder);
    this.setupDragStyles(item);

    item.draggable = true;
    item.addEventListener("dragstart", this.onDragStart);

    const onMouseMove = (event) => {
      this.moveItem(item, shiftX, shiftY, event);
      this.handleDroppable(item, placeholder, event);
    };
    const handleMouseUp = () => {
      this.leaveDroppable(item, placeholder);
      item.removeEventListener("dragstart", this.onDragStart);
      document.removeEventListener("pointermove", onMouseMove);
      document.removeEventListener("pointerup", handleMouseUp);
    };

    document.addEventListener("pointermove", onMouseMove);
    document.addEventListener("pointerup", handleMouseUp);
  };

  onDragStart(event) {
    event.preventDefault();
  }

  createPlaceholder() {
    const placeholder = document.createElement("li");
    placeholder.classList.add(
      "sortable-list__placeholder",
      "sortable-list__item"
    );
    return placeholder;
  }

  insertPlaceholder(item, placeholder) {
    const index = Array.from(this.element.children).indexOf(item);
    this.element.insertBefore(placeholder, this.element.children[index + 1]);
  }

  setupDragStyles(item) {
    item.style.position = "fixed";
    item.style.zIndex = 1000;
  }

  moveItem(item, shiftX, shiftY, event) {
    item.style.left = event.clientX - shiftX + "px";
    item.style.top = event.clientY - shiftY + "px";
  }

  handleDroppable(item, placeholder, event) {
    item.style.visibility = "hidden";
    const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
    item.style.visibility = "visible";

    const droppableBelow = elemBelow?.closest(".sortable-list__item");

    if (this.currentDroppable !== droppableBelow) {
      this.currentDroppable = droppableBelow;
      if (this.currentDroppable) {
        this.enterDroppable(this.currentDroppable, placeholder);
      }
    }
  }

  enterDroppable(element1, element2) {
    if (element1?.parentNode && element2?.parentNode) {
      this.swapElements(element1, element2);
    }
  }

  swapElements(element1, element2) {
    const temp = document.createElement("div");

    element1.parentNode.insertBefore(temp, element1);
    element2.parentNode.replaceChild(element1, element2);
    temp.parentNode.replaceChild(element2, temp);
  }

  leaveDroppable(item, placeholder) {
    if (item?.parentNode && placeholder?.parentNode) {
      const temp = document.createElement("div");
      item.parentNode.insertBefore(temp, item);
      placeholder.parentNode.replaceChild(item, placeholder);
      temp.parentNode.replaceChild(placeholder, temp);
      placeholder.remove();

      this.resetDragStyles(item);
    }
  }

  resetDragStyles(item) {
    item.style.position = "static";
    item.style.zIndex = 1;
  }

  destroy = () => {
    this.remove();
  };

  remove = () => {
    this.element.remove();
    this.detachEventListeners();
  };
}

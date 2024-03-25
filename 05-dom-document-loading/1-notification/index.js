export default class NotificationMessage {
  static lastInstanse;

  constructor(message, props = {}) {
    const {
      duration = 2000,
      type = 'success',
    } = props;

    this.duration = duration;
    this.type = type;
    this.message = message;

    this.element = this.createElement(this.createTemplate());
  }

  createElement(template) {
    const element = document.createElement("div");

    element.innerHTML = template;

    return element.firstElementChild;
  }

  createTemplate() {
    return `
    <div class="notification ${this.type}" style="--value:20s;">
     <div class="timer"></div>
      <div class="inner-wrapper">
      <div class="notification-header">${this.type}</div>
      <div class="notification-body">
       ${this.message}
      </div>
     </div>
    </div>`;
  }

  show(container = document.body) {
    if (NotificationMessage.lastInstanse) {
      NotificationMessage.lastInstanse.destroy();
    }

    NotificationMessage.lastInstanse = this;

    container.append(this.element);

    this.timeoutId = setTimeout(() => {
      this.destroy();
    }, this.duration);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = null;
    this.remove();
  }

}

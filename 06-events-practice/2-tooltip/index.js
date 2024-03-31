class Tooltip {
  static instance;
  element;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  render(tooltipText) {
    if (!this.element) {
      this.element = document.createElement('div');
      this.element.className = 'tooltip';
      document.body.append(this.element);
    }

    this.element.textContent = tooltipText;
    this.element.style.position = 'absolute';
    this.element.style.zIndex = '1000';
    this.element.style.display = 'block'; // Ensure it's visible
  }

  initialize() {
    document.addEventListener('pointerover', this.onPointerOver);
    document.addEventListener('pointerout', this.onPointerOut);
    document.addEventListener('mousemove', this.onMouseMove);
  }

  onPointerOver = event => {
    const tooltipParent = event.target.closest('[data-tooltip]');

    if (tooltipParent) {
      this.render(tooltipParent.dataset.tooltip);
      this.show(event);
    }
  };

  onMouseMove = event => {
    this.move(event);
  };

  onPointerOut = () => {
    this.hide();
  };

  show(event) {
    this.element.classList.add('is-visible');
    this.move(event);
  }

  move(event) {
    const shift = 10;
    const left = event.clientX + shift;
    const top = event.clientY + shift;

    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
  }

  hide() {
    if (this.element) {
      this.element.classList.remove('is-visible');
    }
  }

  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }

    document.removeEventListener('pointerover', this.onPointerOver);
    document.removeEventListener('pointerout', this.onPointerOut);
    document.removeEventListener('mousemove', this.onMouseMove);
  }
}

const tooltip = new Tooltip();
tooltip.initialize();

export default Tooltip;

export default class DoubleSlider {
  constructor({min, max, formatValue = value => value, selected = {from: min, to: max}}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = selected;

    this.render();
    this.initEventListeners();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="range-slider">
        <span data-element="from">${this.formatValue(this.selected.from)}</span>
        <div class="range-slider__inner">
          <span class="range-slider__progress"></span>
          <span class="range-slider__thumb-left"></span>
          <span class="range-slider__thumb-right"></span>
        </div>
        <span data-element="to">${this.formatValue(this.selected.to)}</span>
      </div>
    `;

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.update();
  }

  initEventListeners() {
    const thumbLeft = this.element.querySelector('.range-slider__thumb-left');
    const thumbRight = this.element.querySelector('.range-slider__thumb-right');

    thumbLeft.addEventListener('pointerdown', this.onThumbPointerDown);
    thumbRight.addEventListener('pointerdown', this.onThumbPointerDown);
  }

  onThumbPointerDown = event => {
    event.preventDefault();
    const thumb = event.target;

    this.shiftX = event.clientX - thumb.getBoundingClientRect().left;

    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  };

  onPointerMove = event => {
    event.preventDefault();

    const {left, width} = this.element.querySelector('.range-slider__inner').getBoundingClientRect();
    let newLeft = (event.clientX - left - this.shiftX) / width;

    if (newLeft < 0) {
      newLeft = 0;
    }
    if (newLeft > 1) {
      newLeft = 1;
    }

    let value = Math.round(this.min + (newLeft * (this.max - this.min)));

    if (event.target.classList.contains('range-slider__thumb-left')) {
      this.selected.from = Math.min(value, this.selected.to);
    } else {
      this.selected.to = Math.max(value, this.selected.from);
    }

    this.update();
  };

  onPointerUp = () => {
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);

    this.dispatchRangeSelectEvent();
  };

  update() {
    const {from, to} = this.selected;
    const rangeTotal = this.max - this.min;
    const leftPercent = ((from - this.min) / rangeTotal) * 100;
    const rightPercent = ((to - this.min) / rangeTotal) * 100;

    this.subElements.from.textContent = this.formatValue(from);
    this.subElements.to.textContent = this.formatValue(to);

    const progress = this.element.querySelector('.range-slider__progress');
    progress.style.left = `${leftPercent}%`;
    progress.style.right = `${100 - rightPercent}%`;
  }

  dispatchRangeSelectEvent() {
    this.element.dispatchEvent(new CustomEvent('range-select', {
      detail: this.selected,
      bubbles: true
    }));
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  destroy() {
    this.element.remove();
  }
}

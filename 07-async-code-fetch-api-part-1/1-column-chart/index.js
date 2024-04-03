import fetchJson from './utils/fetch-json.js';
import ColumnChartV1 from '../../04-oop-basic-intro-to-dom/1-column-chart/index.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart extends ColumnChartV1 {
  constructor(props = {}) {
    const {
      data,
      url = '#',
      range = '',
      label = '',
      link = ''
    } = props;

    super({
      data,
      range,
      label,
      link
    });

    this.data = data;
    this.url = url;
    this.range = range;
    this.label = label;
    this.link = link;

  }

  async update(startDate, endDate) {
    const response = fetchJson(`${BACKEND_URL}/${this.url}?from=${startDate}&to=${endDate}`);
    await response.then(result => {
      super.update(Object.values(result));
      this.data = result;
    });
    return (this.data);
  }

}

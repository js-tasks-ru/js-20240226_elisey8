/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const pathParts = path.split('.');
  return function (obj) {
    return pathParts.reduce((obj, key) => (obj && obj[key] !== 'undefined') ? obj[key] : undefined, obj);
  };
}

/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === undefined) {
    return string;
  }

  let result = '';
  let prevChar = '';
  let repeatCount = 0;

  for (let char of string) {
    if (char === prevChar) {
      repeatCount++;
    } else {
      repeatCount = 1;
    }

    if (repeatCount <= size) {
      result += char;
    }

    prevChar = char;
  }

  return result;

}

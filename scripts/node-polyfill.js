// Polyfill for Node 18 - adds Array methods that were added in Node 20
if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function () {
    return this.slice().reverse();
  };
}
if (!Array.prototype.toSorted) {
  Array.prototype.toSorted = function (compareFn) {
    return this.slice().sort(compareFn);
  };
}
if (!Array.prototype.toSpliced) {
  Array.prototype.toSpliced = function (start, deleteCount, ...items) {
    const arr = this.slice();
    arr.splice(start, deleteCount, ...items);
    return arr;
  };
}
if (!Array.prototype.with) {
  Array.prototype.with = function (index, value) {
    const arr = this.slice();
    arr[index] = value;
    return arr;
  };
}

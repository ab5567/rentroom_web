// @flow
/**
 * Helper functions
 * @module Helpers
 */

/**
 * Convert data attributes to Object
 * @param {Element} elem
 * @returns {{}}
 */
export function datasetToObject(elem: Element): Object {
  const data = {};
  [].forEach.call(elem.attributes, attr => {
    /* istanbul ignore else */
    if (/^data-/.test(attr.name)) {
      const camelCaseName = attr.name.substr(5).replace(/-(.)/g, ($0, $1) => $1.toUpperCase());
      data[camelCaseName] = attr.value;
    }
  });
  return data;
}

/**
* Makes first letter uppercase
* @param {String} string, string to be converted
*/
export function capitalizeFirstLetter(string){
  return (string.charAt(0).toUpperCase() + string.slice(1)).replace(/_/g, ' ');;
}

/**
* Gets object class type
* @param {Object} obj
* @example
* getClass("")   === "String";
* getClass(true) === "Boolean";
* getClass(0)    === "Number";
* getClass([])   === "Array";
* getClass({})   === "Object";
* getClass(null) === "null";
*/
export function getClass(obj){
  if (typeof obj === "undefined")
    return "undefined";
  if (obj === null)
    return "null";

  var className=Object.prototype.toString.call(obj).match(/^\[object\s(.*)\]$/)[1];
  if (className=="Object"&&typeof(obj._lat) !== 'undefined'&&typeof(obj._long) !== 'undefined'){
  	className="GeoPoint";
  }else if (className=="Object"&&typeof(obj.firestore) !== 'undefined'&&typeof(obj.parent) !== 'undefined'){
    className="DocumentReference";
  }
  return className;
}



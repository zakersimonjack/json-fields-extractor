function isEmpty(obj) {
  return !obj || Object.keys(obj).length === 0;
}

function castPath(p) {
  return !Array.isArray(p) ? p.replace(/\[/g, '.').replace(/\]/g, '').split('.') : p;
}

function deepGet(obj, rawPath, defaultValue) {
  if (isEmpty(rawPath)) {
    return obj;
  }

  const value = castPath(rawPath).reduce((v, k) => (v || {})[k], obj);
  return typeof value === 'undefined' ? defaultValue : value;
}

function deepSet(obj, rawPath, value) {
  if (typeof obj !== 'object') {
    return obj;
  }

  castPath(rawPath).reduce((o, k, i, path) => {
    if (i === path.length - 1) {
      o[k] = value;
      return null;
    }

    if (k in o) {
      return o[k];
    }

    o[k] = /^[0-9]{1,}$/.test(path[i + 1]) ? [] : {};
    return o[k];
  }, obj);

  return obj;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function startsWith(str, pattern) {
  const reg = new RegExp(`^${escapeRegExp(pattern)}`);
  return reg.test(str);
}

module.exports.isEmpty = isEmpty;
module.exports.deepGet = deepGet;
module.exports.deepSet = deepSet;
module.exports.startsWith = startsWith;

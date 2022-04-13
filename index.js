var util = require('./util');
var JSONDataType = {
  STRING: 'string',
  NUMBER: 'number',
  OBJECT: 'object',
  ARRAY: 'array',
  BOOLEAN: 'boolean',
  NULL:'null',
};

// TODO: support '.' in field name

var arrayFlag = '/-*-/';
var arraySymbol = '$';

function JSONFieldsAnalyzer(data, inputOpt) {
  this.propertySchemaDict = {};
  this.dataToAnalyze = data;

  var opt = inputOpt || {};
  this.opt = {};
  this.opt.extract_mode = opt.extract_mode || 'type'; // type / value
  this.opt.skip_keys_sort = opt.skip_keys_sort;
  this.opt.skip_values_sort = opt.skip_values_sort;
}

JSONFieldsAnalyzer.prototype._getSchemaDict = function _getSchemaDict() {
  var keyValuesPairs = Object.values(this.propertySchemaDict);
  const opt = this.opt;
  var res = {};
  if (!this.opt.skip_keys_sort) {
    keyValuesPairs.sort();
  }

  keyValuesPairs.forEach(function func(pairs) {
    res[pairs[0]] = Array.from(pairs[1]);
    if (!opt.skip_values_sort) {
      res[pairs[0]].sort();
    }
  });
  return res;
}

JSONFieldsAnalyzer.prototype.getPropertySchema = function getPropertySchema() {
  var dataToAnalyze = this.dataToAnalyze;
  var keysToProcess = Object.keys(dataToAnalyze);

  while (!util.isEmpty(keysToProcess)) {
    var rawKey = keysToProcess.pop();
    var addressKeys = this._convertKeys(rawKey, 'address');
    var schemaKeys = this._convertKeys(rawKey, 'schema');
    var val = util.deepGet(dataToAnalyze, addressKeys);
    var valType = this._getJSONDataType(val);

    if (valType === JSONDataType.OBJECT) {
      Object.keys(val).forEach(function func(childKey) {
        keysToProcess.push([].concat(rawKey, childKey));
      });
    } else if (valType === JSONDataType.ARRAY) {
      Object.keys(val).forEach(function func(childKey) {
        keysToProcess.push([].concat(rawKey, arrayFlag + childKey));
      });
    }

    var schemaKeyString = schemaKeys.join('.');
    if (this.opt.extract_mode === 'type') {
      this._putSchemaDictProperty(schemaKeyString, valType);
    } else if (this.opt.extract_mode === 'value') {
      this._putSchemaDictProperty(schemaKeyString, val);
    } else {
      throw Error('Unknown extract_mode: ' + this.opt.extract_mode);
    }
  }

  return this._getSchemaDict();
}

JSONFieldsAnalyzer.prototype._putSchemaDictProperty = function _putSchemaDictProperty(key, valType) {
  var oldSchema = this.propertySchemaDict[key];
  if (!oldSchema) {
    this.propertySchemaDict[key] = [key, new Set([valType])];
  } else {
    this.propertySchemaDict[key][1].add(valType);
  }
}

JSONFieldsAnalyzer.prototype._getJSONDataType = function _getJSONDataType(val) {
  var dataType = typeof val;
  if (val === null) {
    dataType = JSONDataType.NULL;
  } else if (val instanceof Array) {
    dataType = JSONDataType.ARRAY;
  } else if (val instanceof Object) {
    dataType = JSONDataType.OBJECT;
  }

  return dataType;
}

JSONFieldsAnalyzer.prototype._convertKeys = function _convertKeys(rawKeys, mode) {
  if (this._getJSONDataType(rawKeys) === JSONDataType.STRING) {
    return [rawKeys];
  }

  var resKeys = [];
  rawKeys.forEach(function func(key) {
    var hasArrayFlag = util.startsWith(key, arrayFlag);
    if (hasArrayFlag && mode === 'schema') {
      resKeys.push(arraySymbol);
    } else if (hasArrayFlag && mode === 'address') {
      resKeys.push(key.slice(arrayFlag.length));
    } else {
      resKeys.push(key);
    }
  });

  return resKeys;
}

/**
 * get value of object by key
 * @param {object} data, JSON object
 * @param {object} options
 * @returns {object} fields extract result object
 */
function getJSONDataSchema(reqData, opt) {
  var data;
  if (typeof reqData === 'string') {
    data = JSON.parse(reqData);
  } else if (typeof reqData === 'object') {
    data = reqData;
  } else {
    throw Error('Request data must be an object or string');
  }

  return new JSONFieldsAnalyzer(data, opt).getPropertySchema();
}

module.exports = getJSONDataSchema;

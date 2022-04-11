const util = require('./util');
const JSONDataType = {
  STRING: 'string',
  NUMBER: 'number',
  OBJECT: 'object',
  ARRAY: 'array',
  BOOLEAN: 'boolean',
  NULL:'null',
};

// TODO: support '.' in field name

const arrayFlag = '/-*-/';
const arraySymbol = '$';

/**
 * get value of object by key
 * @param {object} data, JSON object
 * @param {object} options
 * @returns {object} fields extract result object
 */
class JSONFieldsAnalyzer {
  constructor(data, opt = {}) {
    this.propertySchemaDict = {};
    this.dataToAnalyze = data;
    this.opt = {};
    this.opt.extract_mode = opt.extract_mode || 'type'; // type / value
    this.opt.skip_keys_sort = opt.skip_keys_sort;
    this.opt.skip_values_sort = opt.skip_values_sort;
  }

  getPropertySchema() {
    const dataToAnalyze = this.dataToAnalyze;
    const keysToProcess = Object.keys(dataToAnalyze);

    while (!util.isEmpty(keysToProcess)) {
      const rawKey = keysToProcess.pop();
      const addressKeys = this._convertKeys(rawKey, 'address');
      const schemaKeys = this._convertKeys(rawKey, 'schema');
      const val = util.deepGet(dataToAnalyze, this._toKeyString(addressKeys));
      const valType = this._getJSONDataType(val);

      if (valType === JSONDataType.OBJECT) {
        Object.keys(val).forEach((childKey) => {
          keysToProcess.push([].concat(rawKey, childKey));
        });
      } else if (valType === JSONDataType.ARRAY) {
        Object.keys(val).forEach((childKey) => {
          keysToProcess.push([].concat(rawKey, `${arrayFlag}${childKey}`));
        });
      }

      const schemaKeyString = this._toKeyString(schemaKeys);
      if (this.opt.extract_mode === 'type') {
        this._putSchemaDictProperty(schemaKeyString, valType);
      } else if (this.opt.extract_mode === 'value') {
        this._putSchemaDictProperty(schemaKeyString, val);
      } else {
        throw Error(`Unknown extract_mode: ${this.opt.extract_mode}`);
      }
    }

    return this._getSchemaDict();
  }

  _getSchemaDict() {
    const keyValuesPairs = Object.values(this.propertySchemaDict);
    const res = {};
    if (!this.opt.skip_keys_sort) {
      keyValuesPairs.sort();
    }

    keyValuesPairs.forEach((pairs) => {
      res[pairs[0]] = Array.from(pairs[1]);
      if (!this.opt.skip_values_sort) {
        res[pairs[0]].sort();
      }
    });
    return res;
  }

  _putSchemaDictProperty(key, valType) {
    const oldSchema = this.propertySchemaDict[key];
    if (!oldSchema) {
      this.propertySchemaDict[key] = [key, new Set([valType])];
    } else {
      this.propertySchemaDict[key][1].add(valType);
    }
  }

  _convertKeys(rawKeys, mode) {
    if (this._getJSONDataType(rawKeys) === JSONDataType.STRING) {
      return rawKeys;
    }

    const resKeys = [];
    rawKeys.forEach((key) => {
      const hasArrayFlag = util.startsWith(key, arrayFlag);
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

  _toKeyString(keys) {
    return [].concat(keys).join('.');
  }

  _getJSONDataType(val) {
    let dataType = typeof val;
    if (val === null) {
      dataType = JSONDataType.NULL;
    } else if (val instanceof Array) {
      dataType = JSONDataType.ARRAY;
    } else if (val instanceof Object) {
      dataType = JSONDataType.OBJECT;
    }

    return dataType;
  }
}

function getJSONDataSchema(reqData, opt) {
  let data;
  if (typeof reqData === 'string') {
    data = JSON.parse(reqData);
  } else if (typeof reqData === 'object') {
    data = reqData;
  } else {
    throw Error('Request data must be an object or string');
  }

  const analyzer = new JSONFieldsAnalyzer(data, opt);
  const res = analyzer.getPropertySchema();
  return res;
}

module.exports = getJSONDataSchema;

# JSON fields extractor

[![npm version](https://img.shields.io/npm/v/json-fields-extractor.svg?style=flat-square)](https://www.npmjs.com/package/json-fields-extractor)
[![install size](https://packagephobia.now.sh/badge?p=json-fields-extractor)](https://packagephobia.now.sh/result?p=json-fields-extractor)
[![npm downloads](https://img.shields.io/npm/dm/json-fields-extractor.svg?style=flat-square)](http://npm-stat.com/charts.html?package=json-fields-extractor)
[![Known Vulnerabilities](https://snyk.io/test/npm/json-fields-extractor/badge.svg)](https://snyk.io/test/npm/json-fields-extractor)

Can extract fields / schema from JSON object or JSON string.

# usage

extractJSON(data, options)

`data` is a JSON object or string

`options` is an optional object:
- `options.extract_mode`
  - `type`(default) extract type of value, there are six types. See [JSON Data Types](https://www.w3schools.com/js/js_json_datatypes.asp)
  - `value` extract value
- `options.skip_keys_sort`(default `false`) skip sorting of result keys
- `options.skip_values_sort`(default `false`) skip sorting of result values

# quick start

**installing**
```
npm install json-fields-extractor
```

test

```

const extractJSON = require('json-fields-extractor');
const extractJSONObjectRes = extractJSON({a: 1}); // { a: [ 'number' ] }

```

# Example
Input JSON Data:
```
{ 
  "str1": "str", 
  "object1": { 
    "obj1_field": "o1f" 
  }, 
  "array1": [ 
    { 
      "arr1_field": "a1f", 
      "arr2_field": 123 
    }, 
    { 
      "arr1_field": 123, 
      "arr2_field": 123 
    }, 
    { 
      "arr3_field": null 
    }, 
    "array_str" 
  ] 
}
```

Output result object:
```
{
  array1: [ 'array' ],
  'array1.$': [ 'object', 'string' ],
  'array1.$.arr1_field': [ 'number', 'string' ],
  'array1.$.arr2_field': [ 'number' ],
  'array1.$.arr3_field': [ 'null' ],
  object1: [ 'object' ],
  'object1.obj1_field': [ 'string' ],
  str1: [ 'string' ],
}
```

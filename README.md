# JSON fields extractor

Can extract fields / schema from JSON object.

# example
JSON:
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

Extract result object:
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

# usage

```

const extractJSON = require('json-fields-extractor');
const extractJSONObjectRes = extractJSON({a: 1}); // { a: [ 'number' ] }
const extractJSONStringRes = extractJSON('\{"a":1\}'); // { a: [ 'number' ] }

```

# TODO
[] support "." in field name

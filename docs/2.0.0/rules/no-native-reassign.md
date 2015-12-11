---
title: Rule no-native-reassign
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Disallow Reassignment of Native Objects (no-native-reassign)

Reports an error when they encounter an attempt to assign a value to built-in native object.

```js
String = "hello world";
```

## Rule Details

The native objects reported by this rule are the `builtin` variables from [globals](https://github.com/sindresorhus/globals/).

The following patterns are considered problems:

```js
/*eslint no-native-reassign: 2*/

String = new Object(); /*error String is a read-only native object.*/
```

## Options

This rule accepts an `exceptions` option, which can be used to specify a list of builtins for which reassignments will be allowed:

```json
{
    "rules": {
        "no-native-reassign": [2, {"exceptions": ["Object"]}]
    }
}
```

## When Not To Use It

If you are trying to override one of the native objects.

## Related Rules

* [no-extend-native](no-extend-native)
* [no-redeclare](no-redeclare)
* [no-shadow](no-shadow)

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-native-reassign.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-native-reassign.md)

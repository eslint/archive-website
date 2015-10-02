---
title: Rule no-octal-escape
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Disallow Octal Escapes (no-octal-escape)

As of version 5 of the ECMAScript specification, octal escape sequences are a deprecated feature and should not be used. It is recommended that Unicode escapes be used instead.

```js
var foo = "Copyright \251";
```

## Rule Details

The rule is aimed at preventing the use of a deprecated JavaScript feature, the use of octal escape sequences. As such it will warn whenever an octal escape sequence is found in a string literal.

The following patterns are considered problems:

```js
/*eslint no-octal-escape: 2*/

var foo = "Copyright \251"; /*error Don't use octal: '\251'. Use '\u....' instead.*/
```

The following patterns are not considered problems:

```js
/*eslint no-octal-escape: 2*/

var foo = "Copyright \u00A9";   // unicode

var foo = "Copyright \xA9";     // hexadecimal
```

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-octal-escape.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-octal-escape.md)

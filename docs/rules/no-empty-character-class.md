---
title: no-empty-character-class
layout: doc
edit_link: https://github.com/eslint/eslint/edit/main/docs/src/rules/no-empty-character-class.md
rule_type: problem
---



(recommended) The `"extends": "eslint:recommended"` property in a configuration file enables this rule.

Disallows empty character classes in regular expressions.

Because empty character classes in regular expressions do not match anything, they might be typing mistakes.

```js
var foo = /^abc[]/;
```

## Rule Details

This rule disallows empty character classes in regular expressions.

Examples of **incorrect** code for this rule:

```js
/*eslint no-empty-character-class: "error"*/

/^abc[]/.test("abcdefg"); // false
"abcdefg".match(/^abc[]/); // null
```

Examples of **correct** code for this rule:

```js
/*eslint no-empty-character-class: "error"*/

/^abc/.test("abcdefg"); // true
"abcdefg".match(/^abc/); // ["abc"]

/^abc[a-z]/.test("abcdefg"); // true
"abcdefg".match(/^abc[a-z]/); // ["abcd"]
```

## Known Limitations

This rule does not report empty character classes in the string argument of calls to the `RegExp` constructor.

Example of a *false negative* when this rule reports correct code:

```js
/*eslint no-empty-character-class: "error"*/

var abcNeverMatches = new RegExp("^abc[]");
```

## Version

This rule was introduced in ESLint 0.22.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/HEAD/lib/rules/no-empty-character-class.js)
* [Test source](https://github.com/eslint/eslint/tree/HEAD/tests/lib/rules/no-empty-character-class.js)
* [Documentation source](https://github.com/eslint/eslint/tree/HEAD/docs/src/rules/no-empty-character-class.md)

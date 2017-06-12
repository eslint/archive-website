---
title: no-useless-escape - Rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow unnecessary escape usage (no-useless-escape)

(recommended) The `"extends": "eslint:recommended"` property in a configuration file enables this rule.

Escaping non-special characters in strings, template literals, and regular expressions doesn't have any effect, as demonstrated in the following example:

```js
let foo = "hol\a"; // > foo = "hola"
let bar = `${foo}\!`; // > bar = "hola!"
let baz = /\:/ // same functionality with /:/
```

## Rule Details

This rule flags escapes that can be safely removed without changing behavior.

Examples of **incorrect** code for this rule:

```js
/*eslint no-useless-escape: "error"*/

"\'";
'\"';
"\#";
"\e";
`\"`;
`\"${foo}\"`;
`\#{foo}`;
/\!/;
/\@/;

```

Examples of **correct** code for this rule:

```js
/*eslint no-useless-escape: "error"*/

"\"";
'\'';
"\x12";
"\u00a9";
"\371";
"xs\u2111";
`\``;
`\${${foo}\}`;
`$\{${foo}\}`;
/\\/g;
/\t/g;
/\w\$\*\^\./;

```

## When Not To Use It

If you don't want to be notified about unnecessary escapes, you can safely disable this rule.

## Version

This rule was introduced in ESLint 2.5.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-useless-escape.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-useless-escape.md)

---
title: no-useless-escape
layout: doc
edit_link: https://github.com/eslint/eslint/edit/main/docs/src/rules/no-useless-escape.md
rule_type: suggestion
---



(recommended) The `"extends": "eslint:recommended"` property in a configuration file enables this rule.



(hasSuggestions) Some problems reported by this rule are manually fixable by editor [suggestions](../developer-guide/working-with-rules#providing-suggestions).

Disallows unnecessary escape characters.

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
/[\[]/;
/[a-z\-]/;
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
`\${${foo}}`;
`$\{${foo}}`;
/\\/g;
/\t/g;
/\w\$\*\^\./;
/[[]/;
/[\]]/;
/[a-z-]/;
```

## When Not To Use It

If you don't want to be notified about unnecessary escapes, you can safely disable this rule.

## Version

This rule was introduced in ESLint 2.5.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/HEAD/lib/rules/no-useless-escape.js)
* [Test source](https://github.com/eslint/eslint/tree/HEAD/tests/lib/rules/no-useless-escape.js)
* [Documentation source](https://github.com/eslint/eslint/tree/HEAD/docs/src/rules/no-useless-escape.md)

---
title: no-tabs - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/no-tabs.md
rule_type: layout
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# disallow all tabs (no-tabs)

Some style guides don't allow the use of tab characters at all, including within comments.

## Rule Details

This rule looks for tabs anywhere inside a file: code, comments or anything else.

Examples of **incorrect** code for this rule:

```js
var a \t= 2;

/**
* \t\t it's a test function
*/
function test(){}

var x = 1; // \t test
```

Examples of **correct** code for this rule:

```js
var a = 2;

/**
* it's a test function
*/
function test(){}

var x = 1; // test
```

### Options

This rule has an optional object option with the following properties:

* `allowIndentationTabs` (default: false): If this is set to true, then the rule will not report tabs used for indentation.

#### allowIndentationTabs

Examples of **correct** code for this rule with the `allowIndentationTabs: true` option:

```js
/* eslint no-tabs: ["error", { allowIndentationTabs: true }] */

function test() {
\tdoSomething();
}

\t// comment with leading indentation tab
```

## When Not To Use It

If you have established a standard where having tabs is fine, then you can disable this rule.

## Compatibility

* **JSCS**: [disallowTabs](https://jscs-dev.github.io/rule/disallowTabs)

## Version

This rule was introduced in ESLint 3.2.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-tabs.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-tabs.md)

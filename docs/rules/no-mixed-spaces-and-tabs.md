---
title: no-mixed-spaces-and-tabs - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/no-mixed-spaces-and-tabs.md
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# disallow mixed spaces and tabs for indentation (no-mixed-spaces-and-tabs)

(recommended) The `"extends": "eslint:recommended"` property in a configuration file enables this rule.

Most code conventions require either tabs or spaces be used for indentation. As such, it's usually an error if a single line of code is indented with both tabs and spaces.

## Rule Details

This rule disallows mixed spaces and tabs for indentation.

Examples of **incorrect** code for this rule:

```js
/*eslint no-mixed-spaces-and-tabs: "error"*/

function add(x, y) {
// --->..return x + y;

      return x + y;
}

function main() {
// --->var x = 5,
// --->....y = 7;

    var x = 5,
        y = 7;
}
```

Examples of **correct** code for this rule:

```js
/*eslint no-mixed-spaces-and-tabs: "error"*/

function add(x, y) {
// --->return x + y;
    return x + y;
}
```

## Options

This rule has a string option.

* `"smart-tabs"` allows mixed spaces and tabs when the latter are used for alignment.

### smart-tabs

Examples of **correct** code for this rule with the `"smart-tabs"` option:

```js
/*eslint no-mixed-spaces-and-tabs: ["error", "smart-tabs"]*/

function main() {
// --->var x = 5,
// --->....y = 7;

    var x = 5,
        y = 7;
}
```


## Further Reading

* [Smart Tabs](https://www.emacswiki.org/emacs/SmartTabs)

## Version

This rule was introduced in ESLint 0.7.1.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-mixed-spaces-and-tabs.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-mixed-spaces-and-tabs.md)

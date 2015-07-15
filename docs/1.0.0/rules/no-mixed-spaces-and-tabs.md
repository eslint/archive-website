---
title: Rule no-mixed-spaces-and-tabs
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Disallow mixed spaces and tabs for indentation (no-mixed-spaces-and-tabs)

Most code conventions require either tabs or spaces be used for indentation. As such, it's usually an error if a single line of code is indented with both tabs and spaces.

## Rule Details

The `no-mixed-spaces-and-tabs` rule is aimed at flagging any lines of code that are indented with a mixture of tabs and spaces.

The following patterns are considered warnings:

```js
function add(x, y) {
--->..return x + y;
}

function main() {
--->var x = 5,
--->....y = 7;
}
```

The following patterns are not warnings:

```js
function add(x, y) {
--->return x + y;
}

/*
 * When the SmartTabs option is enabled the following
 * does not produce a warning.
 */
function main() {
--->var x = 5,
--->....y = 7;
}
```

### Options

* Smart Tabs

This option suppresses warnings about mixed tabs and spaces when the latter are used for alignment only. This technique is called [SmartTabs](http://www.emacswiki.org/emacs/SmartTabs). The option is turned off by default.

You can enable this option by using the following configuration:

```json
"no-mixed-spaces-and-tabs": [2, "smart-tabs"]
```

## Further Reading

* [Smart Tabs](http://www.emacswiki.org/emacs/SmartTabs)

## Version

This rule was introduced in ESLint 0.7.1.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-mixed-spaces-and-tabs.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-mixed-spaces-and-tabs.md)

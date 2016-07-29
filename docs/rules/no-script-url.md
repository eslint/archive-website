---
title: Rule no-script-url
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow Script URLs (no-script-url)

Using `javascript:` URLs is considered by some as a form of `eval`. Code passed in `javascript:` URLs has to be parsed and evaluated by the browser in the same way that `eval` is processed.

## Rule Details

Examples of **incorrect** code for this rule:

```js
/*eslint no-script-url: "error"*/

location.href = "javascript:void(0)";
```

## Compatibility

* **JSHint**: This rule corresponds to `scripturl` rule of JSHint.

## Further Reading

* [What is the matter with script-targeted URLs?](http://stackoverflow.com/questions/13497971/what-is-the-matter-with-script-targeted-urls)

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-script-url.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-script-url.md)

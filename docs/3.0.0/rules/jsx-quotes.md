---
title: jsx-quotes - Rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# enforce the consistent use of either double or single quotes in JSX attributes (jsx-quotes)

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fix) can automatically fix some of the problems reported by this rule.

JSX attribute values can contain string literals, which are delimited with single or double quotes.

```xml
<a b='c' />
<a b="c" />
```

Unlike string literals in JavaScript, string literals within JSX attributes can’t contain escaped quotes.
If you want to have e.g. a double quote within a JSX attribute value, you have to use single quotes as string delimiter.

```xml
<a b="'" />
<a b='"' />
```

## Rule Details

This rule enforces the consistent use of either double or single quotes in JSX attributes.

## Options

This rule has a string option:

* `"prefer-double"` (default) enforces the use of double quotes for all JSX attribute values that don't contain a double quote.
* `"prefer-single"` enforces the use of single quotes for all JSX attribute values that don’t contain a single quote.

### prefer-double

Examples of **incorrect** code for this rule with the default `"prefer-double"` option:

```xml
/*eslint jsx-quotes: ["error", "prefer-double"]*/

<a b='c' />
```

Examples of **correct** code for this rule with the default `"prefer-double"` option:

```xml
/*eslint jsx-quotes: ["error", "prefer-double"]*/

<a b="c" />
<a b='"' />
```

### prefer-single

Examples of **incorrect** code for this rule with the `"prefer-single"` option:

```xml
/*eslint jsx-quotes: ["error", "prefer-single"]*/

<a b="c" />
```

Examples of **correct** code for this rule with the `"prefer-single"` option:

```xml
/*eslint jsx-quotes: ["error", "prefer-single"]*/

<a b='c' />
<a b="'" />
```

## When Not To Use It

You can turn this rule off if you don’t use JSX or if you aren’t concerned with a consistent usage of quotes within JSX attributes.

## Related Rules

* [quotes](quotes)

## Version

This rule was introduced in ESLint 1.4.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/jsx-quotes.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/jsx-quotes.md)

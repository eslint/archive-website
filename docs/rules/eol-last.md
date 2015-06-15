---
title: Rule eol-last
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Require file to end with single newline (eol-last)

Trailing newlines in non-empty files are a common UNIX idiom. Benefits of
trailing newlines include the ability to concatenate or append to files as well
as output files to the terminal without interfering with shell prompts. This
rule enforces newlines for all non-empty programs.

Prior to v0.16.0 this rule also enforced that there was only a single line at
the end of the file. If you still want this behaviour, consider enabling
[no-multiple-empty-lines](no-multiple-empty-lines) and/or
[no-trailing-spaces](no-trailing-spaces).

## Rule Details

The following patterns are considered warnings:

```js
function doSmth() {
  ...
}
```

The following patterns are not warnings:

```js
function doSmth() {
  ...
}
// spaces here
```

## Version

This rule was introduced in ESLint 0.7.1.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/eol-last.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/eol-last.md)

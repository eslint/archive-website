---
title: eol-last - Rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# require or disallow newline at the end of files (eol-last)

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fix) can automatically fix some of the problems reported by this rule.

Trailing newlines in non-empty files are a common UNIX idiom. Benefits of
trailing newlines include the ability to concatenate or append to files as well
as output files to the terminal without interfering with shell prompts.

## Rule Details

This rule enforces at least one newline (or absence thereof) at the end
of non-empty files.

Prior to v0.16.0 this rule also enforced that there was only a single line at
the end of the file. If you still want this behaviour, consider enabling
[no-multiple-empty-lines](no-multiple-empty-lines) with `maxEOF` and/or
[no-trailing-spaces](no-trailing-spaces).

Examples of **incorrect** code for this rule:

```js
/*eslint eol-last: ["error", "always"]*/

function doSmth() {
  var foo = 2;
}
```

Examples of **correct** code for this rule:

```js
/*eslint eol-last: ["error", "always"]*/

function doSmth() {
  var foo = 2;
}\n
```

## Options

This rule has a string option:

* `"always"` (default) enforces that files end with a newline (LF)
* `"never"` enforces that files do not end with a newline
* `"unix"` (deprecated) is identical to "always"
* `"windows"` (deprecated) is identical to "always", but will use a CRLF character when autofixing

**Deprecated:** The options `"unix"` and `"windows"` are deprecated. If you need to enforce a specific linebreak style, use this rule in conjunction with `linebreak-style`.

## Version

This rule was introduced in ESLint 0.7.1.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/eol-last.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/eol-last.md)

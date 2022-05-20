---
title: block-spacing
layout: doc
edit_link: https://github.com/eslint/eslint/edit/main/docs/src/rules/block-spacing.md
rule_type: layout
related_rules:
- space-before-blocks
- brace-style
---



(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

Disallows or enforces spaces inside of blocks after opening blocks and before closing blocks.

## Rule Details

This rule enforces consistent spacing inside an open block token and the next token on the same line. This rule also enforces consistent spacing inside a close block token and previous token on the same line.

## Options

This rule has a string option:

* `"always"` (default) requires one or more spaces
* `"never"` disallows spaces

### always

Examples of **incorrect** code for this rule with the default `"always"` option:

```js
/*eslint block-spacing: "error"*/

function foo() {return true;}
if (foo) { bar = 0;}
function baz() {let i = 0;
    return i;
}

class C {
    static {this.bar = 0;}
}
```

Examples of **correct** code for this rule with the default `"always"` option:

```js
/*eslint block-spacing: "error"*/

function foo() { return true; }
if (foo) { bar = 0; }

class C {
    static { this.bar = 0; }
}
```

### never

Examples of **incorrect** code for this rule with the `"never"` option:

```js
/*eslint block-spacing: ["error", "never"]*/

function foo() { return true; }
if (foo) { bar = 0;}

class C {
    static { this.bar = 0; }
}
```

Examples of **correct** code for this rule with the `"never"` option:

```js
/*eslint block-spacing: ["error", "never"]*/

function foo() {return true;}
if (foo) {bar = 0;}

class C {
    static {this.bar = 0;}
}
```

## When Not To Use It

If you don't want to be notified about spacing style inside of blocks, you can safely disable this rule.

## Version

This rule was introduced in ESLint 1.2.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/HEAD/lib/rules/block-spacing.js)
* [Test source](https://github.com/eslint/eslint/tree/HEAD/tests/lib/rules/block-spacing.js)
* [Documentation source](https://github.com/eslint/eslint/tree/HEAD/docs/src/rules/block-spacing.md)

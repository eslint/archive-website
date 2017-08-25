---
title: semi-style - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/semi-style.md
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Enforce location of semicolons (semi-style)

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fix) can automatically fix some of the problems reported by this rule.

Generally, semicolons are at the end of lines. However, in semicolon-less style, semicolons are at the beginning of lines. This rule enforces that semicolons are at the configured location.

## Rule Details

This rule reports line terminators around semicolons.

This rule has an option.

```json
{
    "semi-style": ["error", "last"],
}
```

- `"last"` (Default) ... enforces that semicolons are at the end of statements.
- `"first"` ... enforces that semicolons are at the beginning of statements. Semicolons of `for` loop heads (`for(a;b;c){}`) should be at the end of lines even if you use this option.

Examples of **incorrect** code for this rule with `"last"` option:

```js
/*eslint semi-style: ["error", "last"]*/

foo()
;[1, 2, 3].forEach(bar)

for (
    var i = 0
    ; i < 10
    ; ++i
) {
    foo()
}
```

Examples of **correct** code for this rule with `"last"` option:

```js
/*eslint semi-style: ["error", "last"]*/

foo();
[1, 2, 3].forEach(bar)

for (
    var i = 0;
    i < 10;
    ++i
) {
    foo()
}
```

Examples of **incorrect** code for this rule with `"first"` option:

```js
/*eslint semi-style: ["error", "first"]*/

foo();
[1, 2, 3].forEach(bar)

for (
    var i = 0
    ; i < 10
    ; ++i
) {
    foo()
}
```

Examples of **correct** code for this rule with `"first"` option:

```js
/*eslint semi-style: ["error", "first"]*/

foo()
;[1, 2, 3].forEach(bar)

for (
    var i = 0;
    i < 10;
    ++i
) {
    foo()
}
```

## When Not To Use It

If you don't want to notify the location of semicolons, then it's safe to disable this rule.

## Related rules

- [no-extra-semi](./no-extra-semi)
- [semi](./semi)
- [semi-spacing](./semi-spacing)

## Version

This rule was introduced in ESLint 4.0.0-beta.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/semi-style.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/semi-style.md)

---
title: Rule space-after-keywords
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# space-after-keywords: enforce consistent spacing after keywords

(removed) This rule was **removed** in ESLint v2.0 and replaced by the [keyword-spacing](keyword-spacing) rule.

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fix) automatically fixed problems reported by this rule.

Some style guides will require or disallow spaces following the certain keywords.

```js
if (condition) {
    doSomething();
} else {
    doSomethingElse();
}

if(condition) {
    doSomething();
}else{
    doSomethingElse();
}
```

## Rule Details

This rule will enforce consistency of spacing after the keywords `if`, `else`, `for`, `while`, `do`, `switch`, `try`, `catch`, `finally`, and `with`.

This rule takes one argument. If it is `"always"` then the keywords must be followed by at least one space. If `"never"`
then there should be no spaces following. The default is `"always"`.

The following patterns are considered problems:

```js
/*eslint space-after-keywords: "error"*/

if(a) {}

if (a) {} else{}

do{} while (a);
```

```js
/*eslint space-after-keywords: ["error", "never"]*/

if (a) {}
```

The following patterns are not considered problems:

```js
/*eslint space-after-keywords: "error"*/

if (a) {}

if (a) {} else {}
```

```js
/*eslint space-after-keywords: ["error", "never"]*/

if(a) {}
```

## Version

This rule was introduced in ESLint 0.6.0 and removed in 2.0.0-beta.3.

## Resources

* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/space-after-keywords.md)

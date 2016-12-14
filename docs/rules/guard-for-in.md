---
title: guard-for-in - Rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Require Guarding for-in (guard-for-in)

Looping over objects with a `for in` loop will include properties that are inherited through the prototype chain. This behavior can lead to unexpected items in your for loop.

```js
for (key in foo) {
    doSomething(key);
}
```

Note that simply checking `foo.hasOwnProperty(key)` is likely to cause an error in some cases; see [no-prototype-builtins](no-prototype-builtins).

## Rule Details

This rule is aimed at preventing unexpected behavior that could arise from using a `for in` loop without filtering the results in the loop. As such, it will warn when `for in` loops do not filter their results with an `if` statement.

Examples of **incorrect** code for this rule:

```js
/*eslint guard-for-in: "error"*/

for (key in foo) {
    doSomething(key);
}
```

Examples of **correct** code for this rule:

```js
/*eslint guard-for-in: "error"*/

for (key in foo) {
    if (Object.prototype.hasOwnProperty.call(foo, key)) {
        doSomething(key);
    }
    if ({}.hasOwnProperty.call(foo, key)) {
        doSomething(key);
    }
}
```

## Related Rules

* [no-prototype-builtins](no-prototype-builtins)

## Further Reading

* [Exploring JavaScript for-in loops](http://javascriptweblog.wordpress.com/2011/01/04/exploring-javascript-for-in-loops/)
* [The pitfalls of using objects as maps in JavaScript](http://www.2ality.com/2012/01/objects-as-maps.html)

## Version

This rule was introduced in ESLint 0.0.6.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/guard-for-in.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/guard-for-in.md)

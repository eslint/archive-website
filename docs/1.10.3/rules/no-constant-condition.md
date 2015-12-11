---
title: Rule no-constant-condition
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Disallow use of constant expressions in conditions (no-constant-condition)

Comparing a literal expression in a condition is usually a typo or development trigger for a specific behavior.

```js
if (false) {
    doSomethingUnfinished();
}
```

This pattern is most likely an error and should be avoided.

## Rule Details

The rule is aimed at preventing the use of a constant expression in a condition.
As such, it warns whenever it sees a constant expression inside a condition expression.

The following patterns are considered problems:

```js
/*eslint no-constant-condition: 2*/

if (true) {             /*error Unexpected constant condition.*/
    doSomething();
}
```

```js
/*eslint no-constant-condition: 2*/

var result = 0 ? a : b; /*error Unexpected constant condition.*/
```

```js
/*eslint no-constant-condition: 2*/

while (-2) {            /*error Unexpected constant condition.*/
    doSomething();
}
```

```js
/*eslint no-constant-condition: 2*/

for (;true;) {          /*error Unexpected constant condition.*/
    doSomething();
}
```

```js
/*eslint no-constant-condition: 2*/

do{                     /*error Unexpected constant condition.*/
    something();
} while (x = -1)
```

The following patterns are not considered problems:

```js
/*eslint no-constant-condition: 2*/

if (x === 0) {
    doSomething();
}
```

```js
/*eslint no-constant-condition: 2*/

do {
    something();
} while (x)
```

```js
/*eslint no-constant-condition: 2*/

for (;;) {
    something();
}
```

## Version

This rule was introduced in ESLint 0.4.1.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-constant-condition.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-constant-condition.md)

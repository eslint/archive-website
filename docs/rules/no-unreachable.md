---
title: no-unreachable - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/no-unreachable.md
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# disallow unreachable code after `return`, `throw`, `continue`, and `break` statements (no-unreachable)

(recommended) The `"extends": "eslint:recommended"` property in a configuration file enables this rule.

Because the `return`, `throw`, `break`, and `continue` statements unconditionally exit a block of code, any statements after them cannot be executed. Unreachable statements are usually a mistake.

```js
function fn() {
    x = 1;
    return x;
    x = 3; // this will never execute
}
```

## Rule Details

This rule disallows unreachable code after `return`, `throw`, `continue`, and `break` statements.

Examples of **incorrect** code for this rule:

```js
/*eslint no-unreachable: "error"*/

function foo() {
    return true;
    console.log("done");
}

function bar() {
    throw new Error("Oops!");
    console.log("done");
}

while(value) {
    break;
    console.log("done");
}

throw new Error("Oops!");
console.log("done");

function baz() {
    if (Math.random() < 0.5) {
        return;
    } else {
        throw new Error();
    }
    console.log("done");
}

for (;;) {}
console.log("done");
```

Examples of **correct** code for this rule, because of JavaScript function and variable hoisting:

```js
/*eslint no-unreachable: "error"*/

function foo() {
    return bar();
    function bar() {
        return 1;
    }
}

function bar() {
    return x;
    var x;
}

switch (foo) {
    case 1:
        break;
        var x;
}
```

## Version

This rule was introduced in ESLint 0.0.6.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-unreachable.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-unreachable.md)

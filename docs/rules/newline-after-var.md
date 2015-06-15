---
title: Rule newline-after-var
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Allow/disallow an empty newline after var statement (newline-after-var)

As of today there is no consistency in separating variable declarations from the rest of the code. Some developers leave an empty line between var statements and the rest of the code like:

        var foo;

        // do something with foo

Whereas others don't leave any empty newlines at all.

        var foo;
        // do something with foo

The problem is when these developers work together in a project. This rule enforces a coding style where empty newlines are allowed or disallowed after `var` statement. It helps the code to look consistent across the entire project.

## Rule Details

This rule enforces a coding style where empty newlines are allowed or disallowed after `var` statement to achieve a consistent coding style across the project.
Invalid option value (anything other than `always` nor `never`), defaults to `always`.

The following patterns are considered warnings:

```js
// When [1, "always"]
var greet = "hello,",
    name = "world";
console.log(greet, name);

// When [1, "never"]
var greet = "hello,",
    name = "world";

console.log(greet, name);

// When [1, "unknown"] - considered to be "always"
var greet = "hello,",
    name = "world";
console.log(greet, name);
```

The following patterns are not considered warnings:

```js
// When [1, "always"]
var greet = "hello,",
    name = "world";

console.log(greet, name);

// When [1, "never"]
var greet = "hello,",
    name = "world";
console.log(greet, name);
```

## Version

This rule was introduced in ESLint 0.18.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/newline-after-var.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/newline-after-var.md)

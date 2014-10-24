---
title: ESLint
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Require Function Strict Mode (strict)

Strict mode is enabled by using the following pragma in your code:

```js
"use strict";
```

When used globally, as in this example, the strict mode pragma applies to all code within a single file. That means all functions defined within the file will run in strict mode.

It's also possible to specify function-level strict mode, such that strict mode applies just to that function. This is the preferred way of applying strict mode so that you know the extent to which strict mode will be used.

## Rule Details

This rule is aimed at ensuring all functions are executed in strict mode.


The following patterns are considered warnings:

```js
function foo() {
    return true;
}
```

The following patterns do not cause a warning:

```js
"use strict";

function foo() {
	return true;
}

// ----------------

function foo() {

    "use strict";

    return true;
}

// ----------------

(function() {
    "use strict";

    // other code
}());
```

## When Not To Use It

If you have functions that you specifically want to run in non-strict mode (due to use of strict mode prohibited properties such as `arguments.callee`), then you should turn this rule off.

## Version

This rule was introduced in ESLint 0.1.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/strict.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/strict.md)

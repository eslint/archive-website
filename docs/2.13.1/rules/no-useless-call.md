---
title: Rule no-useless-call
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow unnecessary `.call()` and `.apply()`. (no-useless-call)

The function invocation can be written by `Function.prototype.call()` and `Function.prototype.apply()`.
But `Function.prototype.call()` and `Function.prototype.apply()` are slower than the normal function invocation.

## Rule Details

This rule is aimed to flag usage of `Function.prototype.call()` and `Function.prototype.apply()` that can be replaced with the normal function invocation.

Examples of **incorrect** code for this rule:

```js
/*eslint no-useless-call: "error"*/

// These are same as `foo(1, 2, 3);`
foo.call(undefined, 1, 2, 3);
foo.apply(undefined, [1, 2, 3]);
foo.call(null, 1, 2, 3);
foo.apply(null, [1, 2, 3]);

// These are same as `obj.foo(1, 2, 3);`
obj.foo.call(obj, 1, 2, 3);
obj.foo.apply(obj, [1, 2, 3]);
```

Examples of **correct** code for this rule:

```js
/*eslint no-useless-call: "error"*/

// The `this` binding is different.
foo.call(obj, 1, 2, 3);
foo.apply(obj, [1, 2, 3]);
obj.foo.call(null, 1, 2, 3);
obj.foo.apply(null, [1, 2, 3]);
obj.foo.call(otherObj, 1, 2, 3);
obj.foo.apply(otherObj, [1, 2, 3]);

// The argument list is variadic.
foo.apply(undefined, args);
foo.apply(null, args);
obj.foo.apply(obj, args);
```

## Known Limitations

This rule compares code statically to check whether or not `thisArg` is changed.
So if the code about `thisArg` is a dynamic expression, this rule cannot judge correctly.

Examples of **incorrect** code for this rule:

```js
/*eslint no-useless-call: "error"*/

a[i++].foo.call(a[i++], 1, 2, 3);
```

Examples of **correct** code for this rule:

```js
/*eslint no-useless-call: "error"*/

a[++i].foo.call(a[i], 1, 2, 3);
```

## When Not To Use It

If you don't want to be notified about unnecessary `.call()` and `.apply()`, you can safely disable this rule.

## Version

This rule was introduced in ESLint 1.0.0-rc-1.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-useless-call.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-useless-call.md)

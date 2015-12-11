---
title: Rule no-delete-var
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Disallow Variables Deletion (no-delete-var)

This rule prevents the use of `delete` operator on variables:

```js
/*eslint no-delete-var: 2*/

var x;
delete x;  /*error Variables should not be deleted.*/
```

The delete operator will only delete the properties of objects. It cannot "delete" variables or anything else. Using them on variables might lead to unexpected behavior.

## Further Reading

* [Only properties should be deleted](http://jslinterrors.com/only-properties-should-be-deleted/)

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-delete-var.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-delete-var.md)

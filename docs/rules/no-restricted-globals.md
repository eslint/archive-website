---
title: Rule no-restricted-globals
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow specific global variables (no-restricted-globals)

Disallowing usage of specific global variables can be useful if you want to allow a set of global
variables by enabling an environment, but still want to disallow some of those.

For instance, early Internet Explorer versions exposed the current DOM event as a global variable
`event`, but using this variable has been considered as a bad practice for a long time. Restricting
this will make sure this variable isn't used in browser code.

## Rule Details

This rule allows you to specify global variable names that you don't want to use in your application.

## Options

This rule takes a list of strings where strings denote the global variable names:

```json
"no-restricted-globals": [2, "event", "fdescribe"]
```

The following patterns are considered problems:

```js
/*global event, fdescribe*/
/*eslint no-restricted-globals: [2, "event", "fdescribe"]*/

function onClick() {
    console.log(event);
}

fdescribe("foo", function() {
});
```

The following patterns are not considered problems:

```js
/*global event*/
/*eslint no-restricted-globals: [2, "event"]*/

import event from "event-module";
```

```js
/*global event*/
/*eslint no-restricted-globals: [2, "event"]*/

var event = 1;
```

## Version

This rule was introduced in ESLint 2.3.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-restricted-globals.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-restricted-globals.md)

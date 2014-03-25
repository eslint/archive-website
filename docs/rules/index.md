---
title: ESLint
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Rules

Rules in ESLint are divided into several categories to help you better understand their value. Additionally, not all rules are enabled by default. Those that are not enabled by default are marked as being off.

## Possible Errors

The following rules point out areas where you might have made mistakes.

* [no-cond-assign](no-cond-assign.html) - disallow assignment in conditional expressions
* [no-console](no-console.html) - disallow use of `console`
* [no-constant-condition](no-constant-condition.html) - disallow use of constant expressions in conditions
* [no-comma-dangle](no-comma-dangle.html) - disallow trailing commas in object literals
* [no-control-regex](no-control-regex.html) - disallow control characters in regular expressions
* [no-debugger](no-debugger.html) - disallow use of `debugger`
* [no-dupe-keys](no-dupe-keys.html) - disallow duplicate keys when creating object literals
* [no-empty](no-empty.html) - disallow empty statements
* [no-empty-class](no-empty-class.html) - disallow the use of empty character classes in regular expressions
* [no-ex-assign](no-ex-assign.html) - disallow assigning to the exception in a `catch` block
* [no-extra-boolean-cast](no-extra-boolean-cast.html) - disallow double-negation boolean casts in a boolean context
* [no-extra-parens](no-extra-parens.html) - disallow unnecessary parentheses
* [no-extra-semi](no-extra-semi.html) - disallow unnecessary semicolons
* [no-func-assign](no-func-assign.html) - disallow overwriting functions written as function declarations
* [no-invalid-regexp](no-invalid-regexp.html) - disallow invalid regular expression strings in the `RegExp` constructor
* [no-negated-in-lhs](no-negated-in-lhs.html) - disallow negation of the left operand of an `in` expression
* [no-obj-calls](no-obj-calls.html) - disallow the use of object properties of the global object (`Math` and `JSON`) as functions
* [no-regex-spaces](no-regex-spaces.html) - disallow multiple spaces in a regular expression literal
* [no-sparse-arrays](no-sparse-arrays.html) - disallow sparse arrays
* [no-unreachable](no-unreachable.html) - disallow unreachable statements after a return, throw, continue, or break statement
* [use-isnan](use-isnan.html) - disallow comparisons with the value `NaN`
* [valid-jsdoc](valid-jsdoc.html) - Ensure JSDoc comments are valid (off by default)

## Best Practices

These are rules designed to prevent you from making mistakes. They either prescribe a better way of doing something or help you avoid footguns.

* [block-scoped-var](block-scoped-var.html) - treat `var` statements as if they were block scoped
* [complexity](complexity.html) - specify the maximum cyclomatic complexity allowed in a program
* [consistent-return](consistent-return.html) - require `return` statements to either always or never specify values
* [curly](curly.html) - specify curly brace conventions for all control statements
* [dot-notation](dot-notation.html) - encourages use of dot notation whenever possible
* [eqeqeq](eqeqeq.html) - require the use of `===` and `!==`
* [guard-for-in](guard-for-in.html) - make sure `for-in` loops have an `if` statement (off by default)
* [no-alert](no-alert.html) - disallow the use of `alert`, `confirm`, and `prompt`
* [no-caller](no-caller.html) - disallow use of `arguments.caller` or `arguments.callee`
* [no-div-regex](no-div-regex.html) - disallow division operators explicitly at beginning of regular expression
* [no-else-return](no-else-return.html) - disallow `else` after a `return` in an `if`.
* [no-empty-label](no-empty-label.html) - disallow use of labels for anything other then loops and switches
* [no-eq-null](no-eq-null.html) - disallow comparisons to null without a type-checking operator
* [no-eval](no-eval.html) - disallow use of `eval()`
* [no-extend-native](no-extend-native.html) - disallow adding to native types
* [no-fallthrough](no-fallthrough.html) - disallow fallthrough of `case` statements
* [no-floating-decimal](no-floating-decimal.html) - disallow the use of leading or trailing decimal points in numeric literals
* [no-implied-eval](no-implied-eval.html) - disallow use of `eval()`-like methods
* [no-labels](no-labels.html) - disallow use of labeled statements
* [no-iterator](no-iterator.html) - disallow usage of `__iterator__` property
* [no-lone-blocks](no-lone-blocks.html) - disallow unnecessary nested blocks
* [no-loop-func](no-loop-func.html) - disallow creation of functions within loops
* [no-multi-str](no-multi-str.html) - disallow use of multiline strings
* [no-native-reassign](no-native-reassign.html) - disallow reassignments of native objects
* [no-new](no-new.html) - disallow use of new operator when not part of the assignment or comparison
* [no-new-func](no-new-func.html) - disallow use of new operator for `Function` object
* [no-new-wrappers](no-new-wrappers.html) - disallows creating new instances of `String`,`Number`, and `Boolean`
* [no-octal](no-octal.html) - disallow use of octal literals
* [no-octal-escape](no-octal-escape.html) - disallow use of octal escape sequences in string literals, such as `var foo = "Copyright \251";`
* [no-proto](no-proto.html) - disallow usage of `__proto__` property
* [no-redeclare](no-redeclare.html) - disallow declaring the same variable more then once
* [no-return-assign](no-return-assign.html) - disallow use of assignment in `return` statement
* [no-script-url](no-script-url.html) - disallow use of javascript: urls.
* [no-self-compare](no-self-compare.html) - disallow comparisons where both sides are exactly the same
* [no-unused-expressions](no-unused-expressions.html) - disallow usage of expressions in statement position
* [no-warning-comments](no-warning-comments.html) - disallow usage of configurable warning terms in comments - e.g. `TODO` or `FIXME`
* [no-with](no-with.html) - disallow use of the `with` statement
* [no-yoda](no-yoda.html) - disallow Yoda conditions
* [radix](radix.html) - require use of the second argument for `parseInt()`
* [wrap-iife](wrap-iife.html) - require immediate function invocation to be wrapped in parentheses

## Strict Mode

These rules relate to using strict mode.

* [no-global-strict](no-global-strict.html) - disallow the `"use strict"` pragma in the global scope
* [no-extra-strict](no-extra-strict.html) - disallow unnecessary use of `"use strict";` when already in strict mode
* [strict](strict.html) - require that all functions are run in strict mode

## Variables

These rules have to do with variable declarations.

* [no-catch-shadow](no-catch-shadow.html) - disallow the catch clause parameter name being the same as a variable in the outer scope
* [no-delete-var](no-delete-var.html) - disallow deletion of variables
* [no-label-var](no-label-var.html) - disallow labels that share a name with a variable
* [no-shadow](no-shadow.html) - disallow declaration of variables already declared in the outer scope
* [no-shadow-restricted-names](no-shadow-restricted-names.html) - disallow shadowing of names such as `arguments`
* [no-undef](no-undef.html) - disallow use of undeclared variables unless mentioned in a `/*global */` block
* [no-undef-init](no-undef-init.html) - disallow use of undefined when initializing variables
* [no-unused-vars](no-unused-vars.html) - disallow declaration of variables that are not used in the code
* [no-use-before-define](no-use-before-define.html) - disallow use of variables before they are defined

## Node.js

These rules are specific to JavaScript running on Node.js.

* [no-mixed-requires](no-mixed-requires.html) - disallow mixing regular variable and require declarations
* [no-path-concat](no-path-concat.html) - disallow string concatenation with `__dirname` and `__filename`
* [no-process-exit](no-process-exit.html) - disallow `process.exit()`
* [no-sync](no-sync.html) - disallow use of synchronous methods (off by default)

## Stylistic Issues

These rules are purely matters of style and are quite subjective.

* [brace-style](brace-style.html) - enforce one true brace style
* [camelcase](camelcase.html) - require camel case names
* [consistent-this](consistent-this.html) - enforces consistent naming when capturing the current execution context (off by default)
* [func-names](func-names.html) - require function expressions to have a name
* [func-style](func-style.html) - enforces use of function declarations or expressions
* [new-cap](new-cap.html) - require a capital letter for constructors
* [new-parens](new-parens.html) - disallow the omission of parentheses when invoking a contructor with no arguments
* [no-nested-ternary](no-nested-ternary.html) - disallow nested ternary expressions
* [no-array-constructor](no-array-constructor.html) - disallow use of the `Array` constructor
* [no-new-object](no-new-object.html) - disallow use of the `Object` constructor
* [no-spaced-func](no-spaced-func.html) - disallow space between function identifier and application
* [no-space-before-semi](no-space-before-semi.html) - disallow space before semicolon
* [no-ternary](no-ternary.html) - disallow the use of ternary operators
* [no-underscore-dangle](no-underscore-dangle.html) - disallow dangling underscores in identifiers
* [no-wrap-func](no-wrap-func.html) - disallow wrapping of none IIFE statements in parents
* [quotes](quotes.html) - specify whether double or single quotes should be used
* [quote-props](quote-props.html) - require quotes around object literal property names
* [semi](semi.html)- require or disallow use of semicolons instead of ASI
* [sort-vars](sort-vars.html) - sort variables within the same declaration block
* [space-in-brackets](space-in-brackets.html) - require or disallow spaces between brackets
* [space-infix-ops](space-infix-ops.html) - require spaces around operators
* [space-return-throw-case](space-return-throw-case.html) - require a space after `return`, `throw`, and `case`
* [space-unary-word-ops](space-unary-word-ops.html) - require a space around word operators such as `typeof`
* [max-nested-callbacks](max-nested-callbacks.html) - specify the maximum depth callbacks can be nested
* [one-var](one-var.html) - allow just one var statement per function
* [wrap-regex](wrap-regex.html) - require regex literals to be wrapped in parentheses

## Legacy

The following rules are included for compatibility with [JSHint](http://jshint.com/) and [JSLint](http://jslint.com/). While the names of the rules may not match up with the JSHint/JSLint counterpart, the functionality is the same.

* [max-depth](max-depth.html) - specify the maximum depth that blocks can be nested (off by default)
* [max-len](max-len.html) - specify the maximum length of a line in your program (off by default)
* [max-params](max-params.html) - limits the number of parameters that can be used in the function declaration. (off by default)
* [max-statements](max-statements.html) - specify the maximum number of statement allowed in a function (off by default)
* [no-bitwise](no-bitwise.html) - disallow use of bitwise operators (off by default)
* [no-plusplus](no-plusplus.html) - disallow use of unary operators, `++` and `--` (off by default)

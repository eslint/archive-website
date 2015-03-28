---
title: List of available rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Rules

Rules in ESLint are divided into several categories to help you better understand their value. Additionally, not all rules are enabled by default. Those that are not enabled by default are marked as being off.

## Possible Errors

The following rules point out areas where you might have made mistakes.

* [comma-dangle](comma-dangle - disallow or enforce trailing commas
* [no-comma-dangle](no-comma-dangle
* [no-cond-assign](no-cond-assign - disallow assignment in conditional expressions
* [no-console](no-console
* [no-constant-condition](no-constant-condition - disallow use of constant expressions in conditions
* [no-control-regex](no-control-regex - disallow control characters in regular expressions
* [no-debugger](no-debugger - disallow use of `debugger`
* [no-dupe-args](no-dupe-args - disallow duplicate arguments in functions
* [no-dupe-keys](no-dupe-keys - disallow duplicate keys when creating object literals
* [no-duplicate-case](no-duplicate-case - disallow a duplicate case label.
* [no-empty](no-empty - disallow empty statements
* [no-empty-class](no-empty-class - disallow the use of empty character classes in regular expressions
* [no-ex-assign](no-ex-assign - disallow assigning to the exception in a `catch` block
* [no-extra-boolean-cast](no-extra-boolean-cast - disallow double-negation boolean casts in a boolean context
* [no-extra-parens](no-extra-parens
* [no-extra-semi](no-extra-semi - disallow unnecessary semicolons
* [no-func-assign](no-func-assign - disallow overwriting functions written as function declarations
* [no-inner-declarations](no-inner-declarations - disallow function or variable declarations in nested blocks
* [no-invalid-regexp](no-invalid-regexp - disallow invalid regular expression strings in the `RegExp` constructor
* [no-irregular-whitespace](no-irregular-whitespace - disallow irregular whitespace outside of strings and comments
* [no-negated-in-lhs](no-negated-in-lhs - disallow negation of the left operand of an `in` expression
* [no-obj-calls](no-obj-calls as functions
* [no-regex-spaces](no-regex-spaces - disallow multiple spaces in a regular expression literal
* [no-reserved-keys](no-reserved-keys
* [no-sparse-arrays](no-sparse-arrays - disallow sparse arrays
* [no-unreachable](no-unreachable - disallow unreachable statements after a return, throw, continue, or break statement
* [use-isnan](use-isnan - disallow comparisons with the value `NaN`
* [valid-jsdoc](valid-jsdoc
* [valid-typeof](valid-typeof - Ensure that the results of typeof are compared against a valid string

## Best Practices

These are rules designed to prevent you from making mistakes. They either prescribe a better way of doing something or help you avoid footguns.

* [block-scoped-var](block-scoped-var
* [complexity](complexity
* [consistent-return](consistent-return - require `return` statements to either always or never specify values
* [curly](curly - specify curly brace conventions for all control statements
* [default-case](default-case
* [dot-notation](dot-notation - encourages use of dot notation whenever possible
* [eqeqeq](eqeqeq - require the use of `===` and `!==`
* [guard-for-in](guard-for-in
* [no-alert](no-alert - disallow the use of `alert`, `confirm`, and `prompt`
* [no-caller](no-caller - disallow use of `arguments.caller` or `arguments.callee`
* [no-div-regex](no-div-regex
* [no-else-return](no-else-return
* [no-empty-label](no-empty-label - disallow use of labels for anything other then loops and switches
* [no-eq-null](no-eq-null
* [no-eval](no-eval`
* [no-extend-native](no-extend-native - disallow adding to native types
* [no-extra-bind](no-extra-bind - disallow unnecessary function binding
* [no-fallthrough](no-fallthrough - disallow fallthrough of `case` statements
* [no-floating-decimal](no-floating-decimal
* [no-implied-eval](no-implied-eval`-like methods
* [no-iterator](no-iterator - disallow usage of `__iterator__` property
* [no-labels](no-labels - disallow use of labeled statements
* [no-lone-blocks](no-lone-blocks - disallow unnecessary nested blocks
* [no-loop-func](no-loop-func - disallow creation of functions within loops
* [no-multi-spaces](no-multi-spaces - disallow use of multiple spaces
* [no-multi-str](no-multi-str - disallow use of multiline strings
* [no-native-reassign](no-native-reassign - disallow reassignments of native objects
* [no-new](no-new - disallow use of new operator when not part of the assignment or comparison
* [no-new-func](no-new-func - disallow use of new operator for `Function` object
* [no-new-wrappers](no-new-wrappers - disallows creating new instances of `String`,`Number`, and `Boolean`
* [no-octal](no-octal - disallow use of octal literals
* [no-octal-escape](no-octal-escape - disallow use of octal escape sequences in string literals, such as `var foo = "Copyright \251";`
* [no-param-reassign](no-param-reassign
* [no-process-env](no-process-env
* [no-proto](no-proto - disallow usage of `__proto__` property
* [no-redeclare](no-redeclare - disallow declaring the same variable more then once
* [no-return-assign](no-return-assign - disallow use of assignment in `return` statement
* [no-script-url](no-script-url - disallow use of javascript: urls.
* [no-self-compare](no-self-compare
* [no-sequences](no-sequences - disallow use of comma operator
* [no-throw-literal](no-throw-literal
* [no-unused-expressions](no-unused-expressions - disallow usage of expressions in statement position
* [no-void](no-void
* [no-warning-comments](no-warning-comments
* [no-with](no-with - disallow use of the `with` statement
* [radix](radix
* [vars-on-top](vars-on-top
* [wrap-iife](wrap-iife
* [yoda](yoda - require or disallow Yoda conditions

## Strict Mode

These rules relate to using strict mode.

* [global-strict](global-strict
* [no-extra-strict](no-extra-strict** disallow unnecessary use of `"use strict";` when already in strict mode
* [strict](strict - controls location of Use Strict Directives

## Variables

These rules have to do with variable declarations.

* [no-catch-shadow](no-catch-shadow
* [no-delete-var](no-delete-var - disallow deletion of variables
* [no-label-var](no-label-var - disallow labels that share a name with a variable
* [no-shadow](no-shadow - disallow declaration of variables already declared in the outer scope
* [no-shadow-restricted-names](no-shadow-restricted-names - disallow shadowing of names such as `arguments`
* [no-undef](no-undef - disallow use of undeclared variables unless mentioned in a `/*global */` block
* [no-undef-init](no-undef-init - disallow use of undefined when initializing variables
* [no-undefined](no-undefined
* [no-unused-vars](no-unused-vars - disallow declaration of variables that are not used in the code
* [no-use-before-define](no-use-before-define - disallow use of variables before they are defined

## Node.js

These rules are specific to JavaScript running on Node.js.

* [handle-callback-err](handle-callback-err
* [no-mixed-requires](no-mixed-requires
* [no-new-require](no-new-require
* [no-path-concat](no-path-concat
* [no-process-exit](no-process-exit
* [no-restricted-modules](no-restricted-modules
* [no-sync](no-sync

## Stylistic Issues

These rules are purely matters of style and are quite subjective.

* [indent](indent
* [brace-style](brace-style
* [camelcase](camelcase - require camel case names
* [comma-spacing](comma-spacing - enforce spacing before and after comma
* [comma-style](comma-style
* [consistent-this](consistent-this
* [eol-last](eol-last - enforce newline at the end of file, with no multiple empty lines
* [func-names](func-names
* [func-style](func-style
* [key-spacing](key-spacing - enforces spacing between keys and values in object literal properties
* [max-nested-callbacks](max-nested-callbacks
* [new-cap](new-cap - require a capital letter for constructors
* [new-parens](new-parens - disallow the omission of parentheses when invoking a constructor with no arguments
* [newline-after-var](newline-after-var
* [no-array-constructor](no-array-constructor - disallow use of the `Array` constructor
* [no-inline-comments](no-inline-comments
* [no-lonely-if](no-lonely-if
* [no-mixed-spaces-and-tabs](no-mixed-spaces-and-tabs - disallow mixed spaces and tabs for indentation
* [no-multiple-empty-lines](no-multiple-empty-lines
* [no-nested-ternary](no-nested-ternary
* [no-new-object](no-new-object - disallow use of the `Object` constructor
* [no-space-before-semi](no-space-before-semi
* [no-spaced-func](no-spaced-func - disallow space between function identifier and application
* [no-ternary](no-ternary
* [no-trailing-spaces](no-trailing-spaces - disallow trailing whitespace at the end of lines
* [no-underscore-dangle](no-underscore-dangle - disallow dangling underscores in identifiers
* [no-wrap-func](no-wrap-func - disallow wrapping of non-IIFE statements in parens
* [one-var](one-var
* [operator-assignment](operator-assignment
* [padded-blocks](padded-blocks
* [quote-props](quote-props
* [quotes](quotes - specify whether double or single quotes should be used
* [semi](semi - require or disallow use of semicolons instead of ASI
* [semi-spacing](semi-spacing - enforce spacing before and after semicolons
* [sort-vars](sort-vars
* [space-after-function-name](space-after-function-name
* [space-after-keywords](space-after-keywords
* [space-before-blocks](space-before-blocks
* [space-before-function-paren](space-before-function-paren
* [space-before-function-parentheses](space-before-function-parentheses
* [space-in-brackets](space-in-brackets
* [space-in-parens](space-in-parens
* [space-infix-ops](space-infix-ops - require spaces around operators
* [space-return-throw-case](space-return-throw-case - require a space after `return`, `throw`, and `case`
* [space-unary-ops](space-unary-ops
* [space-unary-word-ops](space-unary-word-ops
* [spaced-line-comment](spaced-line-comment
* [wrap-regex](wrap-regex

## ECMAScript 6

These rules are only relevant to ES6 environments and are off by default.

* [no-var](no-var
* [generator-star](generator-star
* [generator-star-spacing](generator-star-spacing

## Legacy

The following rules are included for compatibility with [JSHint](http://jshint.com/) and [JSLint](http://jslint.com/). While the names of the rules may not match up with the JSHint/JSLint counterpart, the functionality is the same.

* [max-depth](max-depth
* [max-len](max-len
* [max-params](max-params
* [max-statements](max-statements
* [no-bitwise](no-bitwise
* [no-plusplus](no-plusplus

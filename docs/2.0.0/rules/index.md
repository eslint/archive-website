---
title: List of available rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Rules

Rules in ESLint are divided into several categories to help you better understand their value. All rules are disabled by default. ESLint recommends some rules to catch common problems, and you can use these recommended rules by including `extends: "eslint:recommended"` in your configuration file. The rules that will be enabled when you inherit from `eslint:recommended` are indicated below as "(recommended)". For more information on how to configure rules and use `extends`, please see the [configuration documentation](../user-guide/configuring).

Some rules are fixable using the `--fix` command line flag. Those rules are marked as "(fixable)" below.

## Possible Errors

The following rules point out areas where you might have made mistakes.

* [comma-dangle](comma-dangle) - disallow or enforce trailing commas (recommended)
* [no-cond-assign](no-cond-assign) - disallow assignment in conditional expressions (recommended)
* [no-console](no-console) - disallow use of `console` (recommended)
* [no-constant-condition](no-constant-condition) - disallow use of constant expressions in conditions (recommended)
* [no-control-regex](no-control-regex) - disallow control characters in regular expressions (recommended)
* [no-debugger](no-debugger) - disallow use of `debugger` (recommended)
* [no-dupe-args](no-dupe-args) - disallow duplicate arguments in functions (recommended)
* [no-dupe-keys](no-dupe-keys) - disallow duplicate keys when creating object literals (recommended)
* [no-duplicate-case](no-duplicate-case) - disallow a duplicate case label. (recommended)
* [no-empty-character-class](no-empty-character-class) - disallow the use of empty character classes in regular expressions (recommended)
* [no-empty](no-empty) - disallow empty statements (recommended)
* [no-ex-assign](no-ex-assign) - disallow assigning to the exception in a `catch` block (recommended)
* [no-extra-boolean-cast](no-extra-boolean-cast) - disallow double-negation boolean casts in a boolean context (recommended)
* [no-extra-parens](no-extra-parens) - disallow unnecessary parentheses
* [no-extra-semi](no-extra-semi) - disallow unnecessary semicolons (recommended) (fixable)
* [no-func-assign](no-func-assign) - disallow overwriting functions written as function declarations (recommended)
* [no-inner-declarations](no-inner-declarations) - disallow function or variable declarations in nested blocks (recommended)
* [no-invalid-regexp](no-invalid-regexp) - disallow invalid regular expression strings in the `RegExp` constructor (recommended)
* [no-irregular-whitespace](no-irregular-whitespace) - disallow irregular whitespace outside of strings and comments (recommended)
* [no-negated-in-lhs](no-negated-in-lhs) - disallow negation of the left operand of an `in` expression (recommended)
* [no-obj-calls](no-obj-calls) - disallow the use of object properties of the global object (`Math` and `JSON`) as functions (recommended)
* [no-regex-spaces](no-regex-spaces) - disallow multiple spaces in a regular expression literal (recommended)
* [no-sparse-arrays](no-sparse-arrays) - disallow sparse arrays (recommended)
* [no-unexpected-multiline](no-unexpected-multiline) - Avoid code that looks like two expressions but is actually one (recommended)
* [no-unreachable](no-unreachable) - disallow unreachable statements after a return, throw, continue, or break statement (recommended)
* [use-isnan](use-isnan) - disallow comparisons with the value `NaN` (recommended)
* [valid-jsdoc](valid-jsdoc) - Ensure JSDoc comments are valid
* [valid-typeof](valid-typeof) - Ensure that the results of typeof are compared against a valid string (recommended)

## Best Practices

These are rules designed to prevent you from making mistakes. They either prescribe a better way of doing something or help you avoid footguns.

* [accessor-pairs](accessor-pairs) - Enforces getter/setter pairs in objects
* [array-callback-return](array-callback-return) - Enforces return statements in callbacks of array's methods
* [block-scoped-var](block-scoped-var) - treat `var` statements as if they were block scoped
* [complexity](complexity) - specify the maximum cyclomatic complexity allowed in a program
* [consistent-return](consistent-return) - require `return` statements to either always or never specify values
* [curly](curly) - specify curly brace conventions for all control statements
* [default-case](default-case) - require `default` case in `switch` statements
* [dot-location](dot-location) - enforces consistent newlines before or after dots
* [dot-notation](dot-notation) - encourages use of dot notation whenever possible
* [eqeqeq](eqeqeq) - require the use of `===` and `!==`
* [guard-for-in](guard-for-in) - make sure `for-in` loops have an `if` statement
* [no-alert](no-alert) - disallow the use of `alert`, `confirm`, and `prompt`
* [no-caller](no-caller) - disallow use of `arguments.caller` or `arguments.callee`
* [no-case-declarations](no-case-declarations) - disallow lexical declarations in case clauses (recommended)
* [no-div-regex](no-div-regex) - disallow division operators explicitly at beginning of regular expression
* [no-else-return](no-else-return) - disallow `else` after a `return` in an `if`
* [no-empty-label](no-empty-label) - disallow use of labels for anything other than loops and switches (recommended)
* [no-empty-pattern](no-empty-pattern) - disallow use of empty destructuring patterns (recommended)
* [no-eq-null](no-eq-null) - disallow comparisons to null without a type-checking operator
* [no-eval](no-eval) - disallow use of `eval()`
* [no-extend-native](no-extend-native) - disallow adding to native types
* [no-extra-bind](no-extra-bind) - disallow unnecessary function binding
* [no-fallthrough](no-fallthrough) - disallow fallthrough of `case` statements (recommended)
* [no-floating-decimal](no-floating-decimal) - disallow the use of leading or trailing decimal points in numeric literals
* [no-implicit-coercion](no-implicit-coercion) - disallow the type conversions with shorter notations
* [no-implicit-globals](no-implicit-globals) - disallow `var` and named functions in global scope
* [no-implied-eval](no-implied-eval) - disallow use of `eval()`-like methods
* [no-invalid-this](no-invalid-this) - disallow `this` keywords outside of classes or class-like objects
* [no-iterator](no-iterator) - disallow usage of `__iterator__` property
* [no-labels](no-labels) - disallow use of labeled statements
* [no-lone-blocks](no-lone-blocks) - disallow unnecessary nested blocks
* [no-loop-func](no-loop-func) - disallow creation of functions within loops
* [no-magic-numbers](no-magic-numbers) - disallow the use of magic numbers
* [no-multi-spaces](no-multi-spaces) - disallow use of multiple spaces (fixable)
* [no-multi-str](no-multi-str) - disallow use of multiline strings
* [no-native-reassign](no-native-reassign) - disallow reassignments of native objects
* [no-new-func](no-new-func) - disallow use of new operator for `Function` object
* [no-new-wrappers](no-new-wrappers) - disallows creating new instances of `String`,`Number`, and `Boolean`
* [no-new](no-new) - disallow use of the `new` operator when not part of an assignment or comparison
* [no-octal-escape](no-octal-escape) - disallow use of octal escape sequences in string literals, such as `var foo = "Copyright \251";`
* [no-octal](no-octal) - disallow use of octal literals (recommended)
* [no-param-reassign](no-param-reassign) - disallow reassignment of function parameters
* [no-process-env](no-process-env) - disallow use of `process.env`
* [no-proto](no-proto) - disallow usage of `__proto__` property
* [no-redeclare](no-redeclare) - disallow declaring the same variable more than once (recommended)
* [no-return-assign](no-return-assign) - disallow use of assignment in `return` statement
* [no-script-url](no-script-url) - disallow use of `javascript:` urls.
* [no-self-compare](no-self-compare) - disallow comparisons where both sides are exactly the same
* [no-sequences](no-sequences) - disallow use of the comma operator
* [no-throw-literal](no-throw-literal) - restrict what can be thrown as an exception
* [no-unmodified-loop-condition](no-unmodified-loop-condition) - disallow unmodified conditions of loops
* [no-unused-expressions](no-unused-expressions) - disallow usage of expressions in statement position
* [no-useless-call](no-useless-call) - disallow unnecessary `.call()` and `.apply()`
* [no-useless-concat](no-useless-concat) - disallow unnecessary concatenation of literals or template literals
* [no-void](no-void) - disallow use of the `void` operator
* [no-warning-comments](no-warning-comments) - disallow usage of configurable warning terms in comments - e.g. `TODO` or `FIXME`
* [no-with](no-with) - disallow use of the `with` statement
* [radix](radix) - require use of the second argument for `parseInt()`
* [vars-on-top](vars-on-top) - require declaration of all vars at the top of their containing scope
* [wrap-iife](wrap-iife) - require immediate function invocation to be wrapped in parentheses
* [yoda](yoda) - require or disallow Yoda conditions

## Strict Mode

These rules relate to using strict mode and strict mode directives.

* [strict](strict) - require effective use of strict mode directives

## Variables

These rules have to do with variable declarations.

* [init-declarations](init-declarations) - enforce or disallow variable initializations at definition
* [no-catch-shadow](no-catch-shadow) - disallow the catch clause parameter name being the same as a variable in the outer scope
* [no-delete-var](no-delete-var) - disallow deletion of variables (recommended)
* [no-label-var](no-label-var) - disallow labels that share a name with a variable
* [no-shadow-restricted-names](no-shadow-restricted-names) - disallow shadowing of names such as `arguments`
* [no-shadow](no-shadow) - disallow declaration of variables already declared in the outer scope
* [no-undef-init](no-undef-init) - disallow use of undefined when initializing variables
* [no-undef](no-undef) - disallow use of undeclared variables unless mentioned in a `/*global */` block (recommended)
* [no-undefined](no-undefined) - disallow use of `undefined` variable
* [no-unused-vars](no-unused-vars) - disallow declaration of variables that are not used in the code (recommended)
* [no-use-before-define](no-use-before-define) - disallow use of variables before they are defined

## Node.js and CommonJS

These rules are specific to JavaScript running on Node.js or using CommonJS in the browser.

* [callback-return](callback-return) - enforce `return` after a callback
* [global-require](global-require) - enforce `require()` on top-level module scope
* [handle-callback-err](handle-callback-err) - enforce error handling in callbacks
* [no-mixed-requires](no-mixed-requires) - disallow mixing regular variable and require declarations
* [no-new-require](no-new-require) - disallow use of `new` operator with the `require` function
* [no-path-concat](no-path-concat) - disallow string concatenation with `__dirname` and `__filename`
* [no-process-exit](no-process-exit) - disallow `process.exit()`
* [no-restricted-imports](no-restricted-imports) - restrict usage of specified node imports
* [no-restricted-modules](no-restricted-modules) - restrict usage of specified node modules
* [no-sync](no-sync) - disallow use of synchronous methods

## Stylistic Issues

These rules are purely matters of style and are quite subjective.

* [array-bracket-spacing](array-bracket-spacing) - enforce spacing inside array brackets (fixable)
* [block-spacing](block-spacing) - disallow or enforce spaces inside of single line blocks (fixable)
* [brace-style](brace-style) - enforce one true brace style
* [camelcase](camelcase) - require camel case names
* [comma-spacing](comma-spacing) - enforce spacing before and after comma (fixable)
* [comma-style](comma-style) - enforce one true comma style
* [computed-property-spacing](computed-property-spacing) - require or disallow padding inside computed properties (fixable)
* [consistent-this](consistent-this) - enforce consistent naming when capturing the current execution context
* [eol-last](eol-last) - enforce newline at the end of file, with no multiple empty lines (fixable)
* [func-names](func-names) - require function expressions to have a name
* [func-style](func-style) - enforce use of function declarations or expressions
* [id-length](id-length) - this option enforces minimum and maximum identifier lengths (variable names, property names etc.)
* [id-match](id-match) - require identifiers to match the provided regular expression
* [id-blacklist](id-blacklist) - blacklist certain identifiers to prevent them being used
* [indent](indent) - specify tab or space width for your code (fixable)
* [jsx-quotes](jsx-quotes) - specify whether double or single quotes should be used in JSX attributes (fixable)
* [key-spacing](key-spacing) - enforce spacing between keys and values in object literal properties
* [keyword-spacing](keyword-spacing) - enforce spacing before and after keywords (fixable)
* [linebreak-style](linebreak-style) - disallow mixed 'LF' and 'CRLF' as linebreaks
* [lines-around-comment](lines-around-comment) - enforce empty lines around comments
* [max-depth](max-depth) - specify the maximum depth that blocks can be nested
* [max-len](max-len) - specify the maximum length of a line in your program
* [max-nested-callbacks](max-nested-callbacks) - specify the maximum depth callbacks can be nested
* [max-params](max-params) - limits the number of parameters that can be used in the function declaration.
* [max-statements](max-statements) - specify the maximum number of statement allowed in a function
* [new-cap](new-cap) - require a capital letter for constructors
* [new-parens](new-parens) - disallow the omission of parentheses when invoking a constructor with no arguments
* [newline-after-var](newline-after-var) - require or disallow an empty newline after variable declarations
* [no-array-constructor](no-array-constructor) - disallow use of the `Array` constructor
* [no-bitwise](no-bitwise) - disallow use of bitwise operators
* [no-continue](no-continue) - disallow use of the `continue` statement
* [no-inline-comments](no-inline-comments) - disallow comments inline after code
* [no-lonely-if](no-lonely-if) - disallow `if` as the only statement in an `else` block
* [no-mixed-spaces-and-tabs](no-mixed-spaces-and-tabs) - disallow mixed spaces and tabs for indentation (recommended)
* [no-multiple-empty-lines](no-multiple-empty-lines) - disallow multiple empty lines
* [no-negated-condition](no-negated-condition) - disallow negated conditions
* [no-nested-ternary](no-nested-ternary) - disallow nested ternary expressions
* [no-new-object](no-new-object) - disallow the use of the `Object` constructor
* [no-plusplus](no-plusplus) - disallow use of unary operators, `++` and `--`
* [no-restricted-syntax](no-restricted-syntax) - disallow use of certain syntax in code
* [no-whitespace-before-property](no-whitespace-before-property) - disallow whitespace before properties
* [no-spaced-func](no-spaced-func) - disallow space between function identifier and application (fixable)
* [no-ternary](no-ternary) - disallow the use of ternary operators
* [no-trailing-spaces](no-trailing-spaces) - disallow trailing whitespace at the end of lines (fixable)
* [no-underscore-dangle](no-underscore-dangle) - disallow dangling underscores in identifiers
* [no-unneeded-ternary](no-unneeded-ternary) - disallow the use of ternary operators when a simpler alternative exists
* [object-curly-spacing](object-curly-spacing) - require or disallow padding inside curly braces (fixable)
* [one-var](one-var) - require or disallow one variable declaration per function
* [one-var-declaration-per-line](one-var-declaration-per-line) - require or disallow an newline around variable declarations
* [operator-assignment](operator-assignment) - require assignment operator shorthand where possible or prohibit it entirely
* [operator-linebreak](operator-linebreak) - enforce operators to be placed before or after line breaks
* [padded-blocks](padded-blocks) - enforce padding within blocks
* [quote-props](quote-props) - require quotes around object literal property names
* [quotes](quotes) - specify whether backticks, double or single quotes should be used (fixable)
* [require-jsdoc](require-jsdoc) - Require JSDoc comment
* [semi-spacing](semi-spacing) - enforce spacing before and after semicolons (fixable)
* [semi](semi) - require or disallow use of semicolons instead of ASI (fixable)
* [sort-vars](sort-vars) - sort variables within the same declaration block
* [sort-imports](sort-imports) - sort import declarations within module
* [space-before-blocks](space-before-blocks) - require or disallow a space before blocks (fixable)
* [space-before-function-paren](space-before-function-paren) - require or disallow a space before function opening parenthesis (fixable)
* [space-in-parens](space-in-parens) - require or disallow spaces inside parentheses
* [space-infix-ops](space-infix-ops) - require spaces around operators (fixable)
* [space-unary-ops](space-unary-ops) - require or disallow spaces before/after unary operators (fixable)
* [spaced-comment](spaced-comment) - require or disallow a space immediately following the `//` or `/*` in a comment
* [wrap-regex](wrap-regex) - require regex literals to be wrapped in parentheses

## ECMAScript 6

These rules are only relevant to ES6 environments.

* [arrow-body-style](arrow-body-style) - require braces in arrow function body
* [arrow-parens](arrow-parens) - require parens in arrow function arguments
* [arrow-spacing](arrow-spacing) - require space before/after arrow function's arrow (fixable)
* [constructor-super](constructor-super) - verify calls of `super()` in constructors (recommended)
* [generator-star-spacing](generator-star-spacing) - enforce spacing around the `*` in generator functions (fixable)
* [no-class-assign](no-class-assign) - disallow modifying variables of class declarations (recommended)
* [no-confusing-arrow](no-confusing-arrow) - disallow arrow functions where they could be confused with comparisons
* [no-const-assign](no-const-assign) - disallow modifying variables that are declared using `const` (recommended)
* [no-dupe-class-members](no-dupe-class-members) - disallow duplicate name in class members (recommended)
* [no-new-symbol](no-new-symbol) - disallow use of the `new` operator with the `Symbol` object (recommended)
* [no-this-before-super](no-this-before-super) - disallow use of `this`/`super` before calling `super()` in constructors (recommended)
* [no-var](no-var) - require `let` or `const` instead of `var`
* [no-useless-constructor](no-useless-constructor) - disallow unnecessary constructor
* [object-shorthand](object-shorthand) - require method and property shorthand syntax for object literals
* [prefer-arrow-callback](prefer-arrow-callback) - suggest using arrow functions as callbacks
* [prefer-const](prefer-const) - suggest using `const` declaration for variables that are never modified after declared
* [prefer-reflect](prefer-reflect) - suggest using Reflect methods where applicable
* [prefer-rest-params](prefer-rest-params) - suggest using the rest parameters instead of `arguments`
* [prefer-spread](prefer-spread) - suggest using the spread operator instead of `.apply()`.
* [prefer-template](prefer-template) - suggest using template literals instead of strings concatenation
* [require-yield](require-yield) - disallow generator functions that do not have `yield`
* [yield-star-spacing](yield-star-spacing) - enforce spacing around the `*` in `yield*` expressions (fixable)


## Removed

These rules existed in a previous version of ESLint but have since been replaced by newer rules.

* [generator-star](generator-star) - enforce the position of the `*` in generator functions (replaced by [generator-star-spacing](generator-star-spacing))
* [global-strict](global-strict) - require or disallow the `"use strict"` pragma in the global scope (replaced by [strict](strict))
* [no-arrow-condition](no-arrow-condition) - disallow arrow functions where a condition is expected (replaced by [no-confusing-arrow](no-confusing-arrow) and [no-constant-condition](no-constant-condition))
* [no-comma-dangle](no-comma-dangle) - disallow trailing commas in object literals (replaced by [comma-dangle](comma-dangle))
* [no-empty-class](no-empty-class) - disallow the use of empty character classes in regular expressions (replaced by [no-empty-character-class](no-empty-character-class))
* [no-extra-strict](no-extra-strict) - disallow unnecessary use of `"use strict";` when already in strict mode (replaced by [strict](strict))
* [no-reserved-keys](no-reserved-keys) - disallow reserved words being used as object literal keys
* [no-space-before-semi](no-space-before-semi) - disallow space before semicolon (replaced by [semi-spacing](semi-spacing))
* [no-wrap-func](no-wrap-func) - disallow wrapping of non-IIFE statements in parens (replaced by [no-extra-parens](no-extra-parens))
* [space-after-function-name](space-after-function-name) - require a space after function names (replaced by [space-before-function-paren](space-before-function-paren))
* [space-after-keywords](space-after-keywords) - require a space after certain keywords (fixable) (replaced by [keyword-spacing](keyword-spacing))
* [space-before-function-parentheses](space-before-function-parentheses) - require or disallow space before function parentheses (replaced by [space-before-function-paren](space-before-function-paren))
* [space-before-keywords](space-before-keywords) - require a space before certain keywords (fixable) (replaced by [keyword-spacing](keyword-spacing))
* [space-in-brackets](space-in-brackets) - require or disallow spaces inside brackets (replaced by [object-curly-spacing](object-curly-spacing) and [array-bracket-spacing](array-bracket-spacing))
* [space-return-throw-case](space-return-throw-case) - require a space after `return`, `throw`, and `case` (fixable) (replaced by [keyword-spacing](keyword-spacing))
* [space-unary-word-ops](space-unary-word-ops) - require or disallow spaces before/after unary operators (replaced by [space-unary-ops](space-unary-ops))
* [spaced-line-comment](spaced-line-comment) - require or disallow a space immediately following the `//` in a line comment (replaced by [spaced-comment](spaced-comment))

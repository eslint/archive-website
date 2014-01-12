---
title: ESLint
layout: default
---
# Rules

Rules in ESLint are divided into several categories to help you better understand their value. Additionally, not all rules are enabled by default. Those that are not enabled by default are marked as being off.

## Possible Errors

The following rules point out areas where you might have made mistakes.

* [no-console](no-console.html) - disallow use of `console`
* [no-comma-dangle](no-comma-dangle.html) - disallow trailing commas in object literals
* [no-debugger](no-debugger.html) - disallow use of `debugger`
* [no-empty](no-empty.html) - disallow empty statements
* [no-obj-calls](no-obj-calls.html) - disallow the use of object properties of the global object (`Math` and `JSON`) as functions
* [no-unreachable](no-unreachable.html) - disallow unreachable statements after a return, throw, continue, or break statement
* [use-isnan](use-isnan.html) - disallow comparisons with the value `NaN`
* [no-dupe-keys](no-dupe-keys.html) - disallow duplicate keys when creating object literals
* [no-empty-class](no-empty-class.html) - disallow the use of empty character classes in regular expressions
* [no-func-assign](no-func-assign.html) - disallow overwriting functions written as FunctionDeclarations
* [no-control-regex](no-control-regex.html) - disallow control characters in regular expressions

## Best Practices

These are rules designed to prevent you from making mistakes. They either prescribe a better way of doing something or help you avoid footguns.

* [no-caller](no-caller.html) - disallow use of `arguments.caller` or `arguments.callee`
* [curly](curly.html) - require curly brace for all control statements
* [eqeqeq](eqeqeq.html) - require the use of `===` and `!==`
* [dot-notation](dot-notation.html) - encourages use of dot notation whenever possible
* [no-catch-shadow](no-catch-shadow.html) - disallow the catch clause parameter name being the same as a variable in the outer scope
* [no-eval](no-eval.html) - disallow use of `eval()`
* [no-with](no-with.html) - disallow use of the `with` statement
* [no-undef](no-undef.html) - disallow use of undeclared variables unless mentioned in a `/*global */` block
* [no-undef-init](no-undef-init.html) - disallow use of undefined when initializing variables
* [no-floating-decimal](no-floating-decimal) - disallow the use of leading or trailing decimal points in numeric literals
* [no-octal](no-octal.html) - disallow use of octal literals
* [no-octal-escape](no-octal-escape) - disallow use of octal escape sequences in string literals, such as `var foo = "Copyright \251";`
* [no-new](no-new.html) - disallow use of new operator when not part of the assignment or comparison
* [no-new-func](no-new-func.html) - disallow use of new operator for `Function` object
* [no-native-reassign](no-native-reassign.html) - disallow reassignments of native objects
* [no-delete-var](no-delete-var.html) - disallow deletion of variables
* [no-return-assign](no-return-assign.html) - disallow use of assignment in return statement
* [no-label-var](no-label-var.html) - disallow labels that share a name with a variable
* [wrap-iife](wrap-iife.html) - require immediate function invocation to be wrapped in parentheses
* [no-self-compare](no-self-compare.html) - disallow comparisons where both sides are exactly the same
* [no-eq-null](no-eq-null.html) - disallow comparisons to null without a type-checking operator
* [no-multi-str](no-multi-str.html) - disallow use of multiline strings
* [no-loop-func](no-loop-func.html) - disallow creation of functions within loops
* [no-empty-label](no-empty-label.html) - disallow use of labels for anything other then loops and switches
* [unnecessary-strict](unnecessary-strict.html) - disallow unnecessary use of `"use strict";` when already in strict mode
* [no-unused-expressions](no-unused-expressions.html) - disallow usage of expressions in statement position
* [no-unused-vars](no-unused-vars.html) - disallow declaration of variables that are not used in the code
* [no-script-url](no-script-url.html) - disallow use of javascript: urls.
* [no-proto](no-proto.html) - disallow usage of `__proto__` property
* [no-iterator](no-iterator.html) - disallow usage of `__iterator__` property
* [no-else-return](no-else-return.html) - disallow `else` after a `return` in an `if`.
* [no-shadow](no-shadow.html) - disallow declaration of variables already declared in the outer scope
* [no-alert](no-alert.html) - disallow the use of `alert`, `confirm`, and `prompt`
* [no-use-before-define](no-use-before-define.html) - disallow use of variables before they are defined
* [no-redeclare](no-redeclare.html) - disallow declaring the same variable more then once
* [no-global-strict](no-global-strict.html) - disallow the `"use strict"` pragma in the global scope
* [strict](strict.html) - require that all functions are run in strict mode
* [no-div-regex](no-div-regex.html) - disallow division operators explicitly at beginning of regular expression

## Stylistic Issues

These rules are purely matters of style and are quite subjective.

* [camelcase](camelcase.html) - require camel case names
* [complexity](complexity.html) - specify the maximum cyclomatic complexity allowed in a program
* [consistent-this](consistent-this.html) - enforces consistent naming when capturing the current execution context (off by default).
* [func-style](func-style.html) - enforces use of function declarations or expressions
* [new-cap](new-cap.html) - require a capital letter for constructors
* [new-parens](new-parens.html) - disallow the omission of parentheses when invoking a contructor with no arguments
* [no-mixed-requires](no-mixed-requires.html) - disallow mixing regular variable and require declarations
* [no-nested-ternary](no-nested-ternary.html) - disallow nested ternary expressions
* [no-spaced-func](no-spaced-func.html) - disallow space between function identifier and application
* [no-ternary](no-ternary.html) - disallow the use of ternary operators
* [no-wrap-func](no-wrap-func.html) - disallow wrapping of none IIFE statements in parents
* [quotes](quotes.html) - specify whether double or single quotes should be used
* [quote-props](quote-props.html) - require quotes around object literal property names
* [semi](semi.html) - require use of semicolons instead of relying on ASI
* [sort-vars](sort-vars.html) - sort variables within the same declaration block
* [max-nested-callbacks](max-nested-callbacks.html) - specify the maximum depth callbacks can be nested
* [wrap-regex](wrap-regex.html) - require regex literals to be wrapped in parentheses

## Legacy

The following rules are included for compatibility with [JSHint](http://jshint.com/) and [JSLint](http://jslint.com/). While the names of the rules may not match up with the JSHint/JSLint counterpart, the functionality is the same.

* [no-plusplus](no-plusplus.html) - disallow use of unary operators, `++` and `--` (off by default)
* [no-bitwise](no-bitwise.html) - disallow use of bitwise operators (off by default)
* [guard-for-in](guard-for-in.html) - make sure `for-in` loops have an `if` statement (off by default)
* [max-statements](max-statements.html) - specify the maximum number of statement allowed in a function (off by default)
* [max-params](max-params.html) - limits the number of parameters that can be used in the function declaration. (off by default)
* [max-depth](max-depth.html) - specify the maximum depth that blocks can be nested (off by default)
* [max-len](max-len.html) - specify the maximum length of a line in your program (off by default)

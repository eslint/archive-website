---
title: Documentation
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Migrating to v1.0.0

ESLint v1.0.0 is the first major version release. As a result, there are some significant changes between how ESLint worked during its life in 0.x and how it will work going forward. These changes are the direct result of feedback from the ESLint community of users and were not made without due consideration for the upgrade path. We believe that these changes make ESLint even better, and while some work is necessary to upgrade, we hope the pain of this upgrade is small enough that you will see the benefit of upgrading.

## All Rules Off by Default

The most important difference in v1.0.0 is that all rules are off by default. We made this change after numerous requests to allow turning off the default rules from within configuration files. While that wasn't technically feasible, it was feasible to have all rules off by default and then re-enable rules in configuration files using `extends`. As such, we've made the `--reset` behavior the default and removed this command line option.

When using `--init`, your configuration file will automatically include the following line:

```json
{
    "extends": "eslint:recommended"
}
```

This setting mimics some of the default behavior from 0.x, but not all. If you don't want to use any of the recommended rules, you can delete this line.

**To address:** If you are currently using `--reset`, then you should stop passing `--reset` on the command line; no other changes are necessary. If you are not using `--reset`, then you should review your configuration to determine which rules should be on by default. You can partially restore some of the default behavior by adding the following to your configuration file:


The `"eslint:recommended"` configuration contains many of the same default rule settings from 0.x, but not all. You should review your settings for the following rules to ensure they are still as you expect:

* [no-alert](https://eslint.org/docs/rules/no-alert)
* [no-array-constructor](https://eslint.org/docs/rules/no-array-constructor)
* [no-caller](https://eslint.org/docs/rules/no-caller)
* [no-catch-shadow](https://eslint.org/docs/rules/no-catch-shadow)
* [no-empty-label](https://eslint.org/docs/rules/no-empty-label)
* [no-eval](https://eslint.org/docs/rules/no-eval)
* [no-extend-native](https://eslint.org/docs/rules/no-extend-native)
* [no-extra-bind](https://eslint.org/docs/rules/no-extra-bind)
* [no-extra-strict](https://eslint.org/docs/rules/no-extra-strict)
* [no-implied-eval](https://eslint.org/docs/rules/no-implied-eval)
* [no-iterator](https://eslint.org/docs/rules/no-iterator)
* [no-label-var](https://eslint.org/docs/rules/no-label-var)
* [no-labels](https://eslint.org/docs/rules/no-labels)
* [no-lone-blocks](https://eslint.org/docs/rules/no-lone-blocks)
* [no-loop-func](https://eslint.org/docs/rules/no-loop-func)
* [no-multi-spaces](https://eslint.org/docs/rules/no-multi-spaces)
* [no-multi-str](https://eslint.org/docs/rules/no-multi-str)
* [no-native-reassign](https://eslint.org/docs/rules/no-native-reassign)
* [no-new](https://eslint.org/docs/rules/no-new)
* [no-new-func](https://eslint.org/docs/rules/no-new-func)
* [no-new-object](https://eslint.org/docs/rules/no-new-object)
* [no-new-wrappers](https://eslint.org/docs/rules/no-new-wrappers)
* [no-octal-escape](https://eslint.org/docs/rules/no-octal-escape)
* [no-process-exit](https://eslint.org/docs/rules/no-process-exit)
* [no-proto](https://eslint.org/docs/rules/no-proto)
* [no-return-assign](https://eslint.org/docs/rules/no-return-assign)
* [no-script-url](https://eslint.org/docs/rules/no-script-url)
* [no-sequences](https://eslint.org/docs/rules/no-sequences)
* [no-shadow](https://eslint.org/docs/rules/no-shadow)
* [no-shadow-restricted-names](https://eslint.org/docs/rules/no-shadow-restricted-names)
* [no-spaced-func](https://eslint.org/docs/rules/no-spaced-func)
* [no-trailing-spaces](https://eslint.org/docs/rules/no-trailing-spaces)
* [no-undef-init](https://eslint.org/docs/rules/no-undef-init)
* [no-underscore-dangle](https://eslint.org/docs/rules/no-underscore-dangle)
* [no-unused-expressions](https://eslint.org/docs/rules/no-unused-expressions)
* [no-use-before-define](https://eslint.org/docs/rules/no-use-before-define)
* [no-with](https://eslint.org/docs/rules/no-with)
* [no-wrap-func](https://eslint.org/docs/rules/no-wrap-func)
* [camelcase](https://eslint.org/docs/rules/camelcase)
* [comma-spacing](https://eslint.org/docs/rules/comma-spacing)
* [consistent-return](https://eslint.org/docs/rules/consistent-return)
* [curly](https://eslint.org/docs/rules/curly)
* [dot-notation](https://eslint.org/docs/rules/dot-notation)
* [eol-last](https://eslint.org/docs/rules/eol-last)
* [eqeqeq](https://eslint.org/docs/rules/eqeqeq)
* [key-spacing](https://eslint.org/docs/rules/key-spacing)
* [new-cap](https://eslint.org/docs/rules/new-cap)
* [new-parens](https://eslint.org/docs/rules/new-parens)
* [quotes](https://eslint.org/docs/rules/quotes)
* [semi](https://eslint.org/docs/rules/semi)
* [semi-spacing](https://eslint.org/docs/rules/semi-spacing)
* [space-infix-ops](https://eslint.org/docs/rules/space-infix-ops)
* [space-return-throw-case](https://eslint.org/docs/rules/space-return-throw-case)
* [space-unary-ops](https://eslint.org/docs/rules/space-unary-ops)
* [strict](https://eslint.org/docs/rules/strict)
* [yoda](https://eslint.org/docs/rules/yoda)

## Removed Rules

Over the past several releases, we have been deprecating rules and introducing new rules to take their place. The following is a list of the removed rules and their replacements:

* [generator-star](https://eslint.org/docs/rules/generator-star) is replaced by [generator-star-spacing](https://eslint.org/docs/rules/generator-star-spacing)
* [global-strict](https://eslint.org/docs/rules/global-strict) is replaced by [strict](https://eslint.org/docs/rules/strict)
* [no-comma-dangle](https://eslint.org/docs/rules/no-comma-dangle) is replaced by [comma-dangle](https://eslint.org/docs/rules/comma-dangle)
* [no-empty-class](https://eslint.org/docs/rules/no-empty-class) is replaced by [no-empty-character-class](https://eslint.org/docs/rules/no-empty-character-class)
* [no-extra-strict](https://eslint.org/docs/rules/no-extra-strict) is replaced by [strict](https://eslint.org/docs/rules/strict)
* [no-space-before-semi](https://eslint.org/docs/rules/no-space-before-semi) is replaced by [semi-spacing](https://eslint.org/docs/rules/semi-spacing)
* [no-wrap-func](https://eslint.org/docs/rules/no-wrap-func) is replaced by [no-extra-parens](https://eslint.org/docs/rules/no-extra-parens)
* [space-after-function-name](https://eslint.org/docs/rules/space-after-function-name) is replaced by [space-before-function-paren](https://eslint.org/docs/rules/space-before-function-paren)
* [space-before-function-parentheses](https://eslint.org/docs/rules/space-before-function-parentheses) is replaced by [space-before-function-paren](https://eslint.org/docs/rules/space-before-function-paren)
* [space-in-brackets](https://eslint.org/docs/rules/space-in-brackets) is replaced by[object-curly-spacing](https://eslint.org/docs/rules/object-curly-spacing) and [array-bracket-spacing](https://eslint.org/docs/rules/array-bracket-spacing)
* [space-unary-word-ops](https://eslint.org/docs/rules/space-unary-word-ops) is replaced by [space-unary-ops](https://eslint.org/docs/rules/space-unary-ops)
* [spaced-line-comment](https://eslint.org/docs/rules/spaced-line-comment) is replaced by [spaced-comment](https://eslint.org/docs/rules/spaced-comment)

**To address:** You'll need to update your rule configurations to use the new rules. ESLint v1.0.0 will also warn you when you're using a rule that has been removed and will suggest the replacement rules. Hopefully, this will result in few surprises during the upgrade process.

## Column Numbers are 1-based

From the beginning, ESLint has reported errors using 0-based columns because that's what Esprima, and later Espree, reported. However, most tools and editors use 1-based columns, which made for some tricky integrations with ESLint. In v1.0.0, we've switched over to reporting errors using 1-based columns to fall into line with the tools developers use everyday.

**To address:** If you've created an editor integration, or a tool that had to correct the column number, you'll need to update to just pass through the column number from ESLint. Otherwise, no change is necessary.

## No Longer Exporting cli

In 0.x, the `cli` object was exported for use by external tools. It was later deprecated in favor of `CLIEngine`. In v1.0.0, we are no longer exporting `cli` as it should not be used by external tools. This will break existing tools that make use of it.

**To address:** If you are using the exported `cli` object, switch to using `CLIEngine` instead.

## Deprecating eslint-tester

The `eslint-tester` module, which has long been the primary tester for ESLint rules, has now been moved into the `eslint` module. This was the result of a difficult relationship between these two modules that created circular dependencies and was causing a lot of problems in rule tests. Moving the tester into the `eslint` module fixed a lot of those issues. You can now access the same object from `eslint-tester` via:

```js
var ESLintTester = require("eslint").ESLintTester;
```

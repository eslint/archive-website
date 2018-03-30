---
title: no-unused-labels - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/no-unused-labels.md
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow Unused Labels (no-unused-labels)

(recommended) The `"extends": "eslint:recommended"` property in a configuration file enables this rule.

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fix) can automatically fix some of the problems reported by this rule.

Labels that are declared and not used anywhere in the code are most likely an error due to incomplete refactoring.

```js
OUTER_LOOP:
for (const student of students) {
    if (checkScores(student.scores)) {
        continue;
    }
    doSomething(student);
}
```

In this case, probably removing `OUTER_LOOP:` had been forgotten.
Such labels take up space in the code and can lead to confusion by readers.

## Rule Details

This rule is aimed at eliminating unused labels.

Examples of **incorrect** code for this rule:

```js
/*eslint no-unused-labels: "error"*/

A: var foo = 0;

B: {
    foo();
}

C:
for (let i = 0; i < 10; ++i) {
    foo();
}
```

Examples of **correct** code for this rule:

```js
/*eslint no-unused-labels: "error"*/

A: {
    if (foo()) {
        break A;
    }
    bar();
}

B:
for (let i = 0; i < 10; ++i) {
    if (foo()) {
        break B;
    }
    bar();
}
```

## When Not To Use It

If you don't want to be notified about unused labels, then it's safe to disable this rule.

## Related Rules

* [no-extra-label](./no-extra-label)
* [no-labels](./no-labels)
* [no-label-var](./no-label-var)

## Version

This rule was introduced in ESLint 2.0.0-rc.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-unused-labels.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-unused-labels.md)

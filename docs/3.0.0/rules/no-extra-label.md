---
title: no-extra-label - Rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow Unnecessary Labels (no-extra-label)

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fix) can automatically fix some of the problems reported by this rule.

If a loop contains no nested loops or switches, labeling the loop is unnecessary.

```js
A: while (a) {
    break A;
}
```

You can achieve the same result by removing the label and using `break` or `continue` without a label.
Probably those labels would confuse developers because they expect labels to jump to further.

## Rule Details

This rule is aimed at eliminating unnecessary labels.

Examples of **incorrect** code for this rule:

```js
/*eslint no-extra-label: "error"*/

A: while (a) {
    break A;
}

B: for (let i = 0; i < 10; ++i) {
    break B;
}

C: switch (a) {
    case 0:
        break C;
}
```

Examples of **correct** code for this rule:

```js
/*eslint no-extra-label: "error"*/

while (a) {
    break;
}

for (let i = 0; i < 10; ++i) {
    break;
}

switch (a) {
    case 0:
        break;
}

A: {
    break A;
}

B: while (a) {
    while (b) {
        break B;
    }
}

C: switch (a) {
    case 0:
        while (b) {
            break C;
        }
        break;
}
```

## When Not To Use It

If you don't want to be notified about usage of labels, then it's safe to disable this rule.

## Related Rules

* [no-labels](./no-labels)
* [no-label-var](./no-label-var)
* [no-unused-labels](./no-unused-labels)

## Version

This rule was introduced in ESLint 2.0.0-rc.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-extra-label.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-extra-label.md)

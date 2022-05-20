---
title: no-extra-label
layout: doc
edit_link: https://github.com/eslint/eslint/edit/main/docs/src/rules/no-extra-label.md
rule_type: suggestion
related_rules:
- no-labels
- no-label-var
- no-unused-labels
---



(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

Disallows unnecessary labels.

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

## Version

This rule was introduced in ESLint 2.0.0-rc.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/HEAD/lib/rules/no-extra-label.js)
* [Test source](https://github.com/eslint/eslint/tree/HEAD/tests/lib/rules/no-extra-label.js)
* [Documentation source](https://github.com/eslint/eslint/tree/HEAD/docs/src/rules/no-extra-label.md)

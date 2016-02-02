---
title: Rule template-curly-spacing
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Enforce Usage of Spacing in Template Strings (template-curly-spacing)

We can embed expressions in template strings with using a pair of `${` and `}`.
This rule can force usage of spacing inside of the curly brace pair according to style guides.

```js
let hello = `hello, ${people.name}!`;
```

**Fixable:** This rule is automatically fixable using the `--fix` flag on the command line.

## Rule Details

This rule aims to maintain consistency around the spacing inside of template literals.

### Options

```json
{
    "template-curly-spacing": [2, "never"]
}
```

This rule has one option which has either `"never"` or `"always"` as value.

* `"never"` (by default) - Disallows spaces inside of the curly brace pair.
* `"always"` - Requires one or more spaces inside of the curly brace pair.

The following patterns are considered problems when configured `"never"`:

```js
/*eslint template-curly-spacing: 2*/

`hello, ${ people.name}!`;  /*error Unexpected space(s) after '${'.*/
`hello, ${people.name }!`;  /*error Unexpected space(s) before '}'.*/

`hello, ${ people.name }!`; /*error Unexpected space(s) after '${'.*/
                            /*error Unexpected space(s) before '}'.*/
```

The following patterns are considered problems when configured `"always"`:

```js
/*eslint template-curly-spacing: [2, "always"]*/

`hello, ${ people.name}!`;  /*error Expected space(s) before '}'.*/
`hello, ${people.name }!`;  /*error Expected space(s) after '${'.*/

`hello, ${people.name}!`;   /*error Expected space(s) after '${'.*/
                            /*error Expected space(s) before '}'.*/
```

The following patterns are not considered problems when configured `"never"`:

```js
/*eslint template-curly-spacing: 2*/

`hello, ${people.name}!`;

`hello, ${
    people.name
}!`;
```

The following patterns are not considered problems when configured `"always"`:

```js
/*eslint template-curly-spacing: [2, "always"]*/

`hello, ${ people.name }!`;

`hello, ${
    people.name
}!`;
```

## When Not To Use It

If you don't want to be notified about usage of spacing inside of template strings, then it's safe to disable this rule.

## Version

This rule was introduced in ESLint 2.0.0-rc.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/template-curly-spacing.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/template-curly-spacing.md)

---
title: Rule no-extra-strict
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# no-extra-strict: disallow strict mode directives when already in strict mode

(removed) This rule was **removed** in ESLint v1.0 and **replaced** by the [strict](strict) rule. The `"global"` or `"function"` options in the new rule are similar to the removed rule.

The `"use strict";` directive applies to the scope in which it appears and all inner scopes contained within that scope. Therefore, using the `"use strict";` directive in one of these inner scopes is unnecessary.

```js
"use strict";

(function () {
    "use strict";
    var foo = true;
}());
```

## Rule Details

This rule is aimed at preventing unnecessary `"use strict";` directives. As such, it will warn when it encounters a `"use strict";` directive when already in strict mode.

The following patterns are considered problems:

```js
"use strict";

(function () {
    "use strict";
    var foo = true;
}());
```

The following patterns are not considered problems:

```js
"use strict";

(function () {
    var foo = true;
}());
```



```js
(function () {
    "use strict";
    var foo = true;
}());
```

## Further Reading

* [The ECMAScript 5 Annotated Specification - Strict Mode](http://es5.github.io/#C)

## Version

This rule was introduced in ESLint 0.3.0 and removed in 1.0.0-rc-1.

## Resources

* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-extra-strict.md)

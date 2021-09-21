---
title: Breaking change to ESLint default formatter
tags:
  - breaking change
  - formatter
---

In the next version of ESLint, scheduled for release next week, there is a breaking change to the default formatter. Up until this point, the default formatter was the "compact" formatter, which outputs data such as:

```
foo.js: line 5, col 10, Error - Unexpected foo. (foo)
foo.js: line 6, col 11, Warning - Unexpected bar. (bar)\n\n2 problems
```

Beginning with the next version of ESLint, the default formatter will be "stylish", and that outputs information such as:

```
foo.js
  5:10  error    Unexpected foo  foo
  6:11  warning  Unexpected bar  bar

2 problems
```

We think the stylish formatter is a much better user experience for those using the command line manually, making it easier to see which files are causing which problems.

## What breaks?

It has come to our attention that some tools are using ESLint on the command line, assuming that the compact formatter is being used, and then processing that information into another format. If you are using ESLint in this way, you should update your tool immediately to specify the compact formatter instead of just using the default:

```
eslint -f compact foo.js
```

This works equally well with older and new versions of ESLint, and will continue to work going forward.

In general, it is always best to specify the formatter that you want when processing output, rather than relying on the default (which may change, as in this case). The current set of formatters is considered stable and none of them will be removed in the future, so it's safe to rely on them.

---
title: Introducing Espree, an Esprima alternative
tags:
  - ES6
  - JSX
---

Since ESLint's very first release, we've built on top of the open source [Esprima](http://esprima.org) parser. Doing so allowed us to get a drop-in, production-ready parser on which we could built the linter of our dreams. That meant we could spend less time worrying about parsing JavaScript code and more time figuring out the best ways to work with that code. ESLint is built around the SpiderMonkey AST produced by Esprima and that decision served us well up until this point.

Earlier this year as we were attempting to include ECMAScript 6 and JSX support in ESLint, we ran into a lot of problems. Esprima's ECMAScript 6 support hadn't been published and there hadn't been a new release in several months. In the meantime, Facebook had created its own fork that had both ECMAScript 6 and JSX support, and so we attempted to use that instead, hoping for a drop-in replacement. Unfortunately, we found several key disparities between the way it worked and Esprima 1.2.2, the version upon which ESLint is currently based. These made it impossible to continue forward because it would have required massive changes not only to our own code base, but also to third-party plugins in the ESLint ecosystem. We tried filing bugs to get answers to these issues and unfortunately were unable to resolve them.

We also investigated using [Acorn](http://marijnhaverbeke.nl/acorn/), another fantastic project that produces a SpiderMonkey AST. Unfortunately, ESLint had grown to rely on some Esprima-specific features such as the way tokens are represented and how comments are attached to nodes. Having the same AST wasn't enough, we would either have to change a large amount of code or create an adapter that would have to be kept in sync for the foreseeable future.

After a lot of thought and consideration, we decided the correct course of action was to create our own parser that we could control. This brings us in line with both JSHint and JSLint, as both have their own parsers (that are not split out from the projects).

## Enter Espree

[Espree](https://github.com/eslint/espree) is a fork of Esprima starting at version 1.2.2. This was the last stable released version that ESLint used and we wanted to keep everything working as much as possible. The plan is quickly implement all of ECMAScript 6 and JSX so that ESLint can support these much-requested variants. We are doing this in a very deliberate manner, pulling over one feature at a time and verifying it against a new suite of tests. In doing so, we hope to avoid the breaking changes of the Esprima Harmony branch so that ESLint can continue to work with the new syntax.

As with the ESLint project itself, we are committed to fast responses to issues and pull requests, and will be doing frequent releases as enhancements and bug fixes are made. In fact, we've already had [four releases](https://github.com/eslint/espree/releases) in the past week.

The immediate short-term goal is to have an API that is a drop-in replacement for Esprima in projects that use it. The next version of ESLint will be built on Espree instead of Esprima.

### Feature Flags

One of the biggest differences between Esprima and Espree is the use of feature flags to turn on or off additional language features. Projects attempting to implement ECMAScript 6 have often been slowed by feeling the need to implement every part of the massive specification before releasing. Espree's approach is different: we implement each part of the spec and hide it behind a feature flag. That means no backwards-incompatible changes are introduced when a new ECMAScript feature is implemented in the parser. You need to opt-in to using that new feature, otherwise, it stays off.

Take a look at the [usage instructions](https://github.com/eslint/espree#usage) for more information on the currently available feature flags.

## How You Can Help

There are a number of ways you can help the Espree project:

1. **Are you a designer?**
  * We need help [designing a logo](https://github.com/eslint/espree/issues/24)
  * We also need help [designing a website](https://github.com/eslint/espree/issues/25)
1. **Are you an engineer?**
  * File bugs for things that aren't working quite right
  * Fix bugs
  * Implement new features
  * Write some documentation

## Other Questions

**Will you be generating a Shift AST in the future?**

The [Shift AST](http://engineering.shapesecurity.com/2014/12/announcing-shift-javascript-ast.html) specification was just announced today, and so we'll be evaluating its response and the technical details going forward. Assuming this is a change the ESLint/Espree community wants, we'll investigate the effort to optionally support the Shift AST. This decision will also be informed by the amount of uptake the Shift AST specification receives in the community as a whole.

**Are you going to support JSX?**

Yes. We've received enough requests for JSX support that it makes sense to include it as a feature flag in Espree.

**Are you going to support Flow types or TypeScript?**

There's a lot going on in the world of optional typing for JavaScript. At the moment, it seems to early to call a winner and decide which type system is the correct one to implement. We'll continue to watch this area very closely to see if consensus can be reached. If so, we'd love to implement optional typing.

**How frequently will you release?**

At least once a month, hopefully more frequently, until all of ECMAScript 6 and JSX is implemented. Then we will focus on any bug reports that come in and doing patch releases to fix them.

---
title: Announcing ES6 and JSX Support
tags:
  - ES6
  - JSX
---

We've been working on [#1291](https://github.com/eslint/eslint/issues/1291) for a while to see how we could add support for ECMAScript 6 and JSX into ESLint. While we were investigating adding ES6 support, we were also getting a fair amount of requests to add JSX support. We soon realized that Facebook's Esprima fork that supports both ES6 and JSX would be the easiest way to move forward.

This left us with some questions about how to support ES6 and JSX in ESLint without disrupting the user experience for those who don't want support. When you are working in a strict ES5 environment, you don't want ES6 and JSX patterns to be parsed as correct, you want a syntax error to be thrown. So a lot of the work has been going into thinking through this problem - ensuring those who want the support can get it while ensuring those who don't will get the syntax errors that they expect.

## Work has begun

Beginning today, work for integrating ES6 and JSX will begin. What that means is:

* Work begins on the `es6jsx` branch on the main [ESLint repo](https://github.com/eslint/eslint/tree/es6jsx).
* Development will be ongoing on both `master` and `es6jsx` branches simultaneously. The `es6jsx` branch will periodically pull in changes from `master` to stay up-to-date.
* Issues will be labeled [es6jsx](https://github.com/eslint/eslint/labels/es6jsx) if they directly relate to this support.
* Release candidates will regularly be published to npm with the `es6jsx` tag.

## Testing it out

You can install the latest ES6/JSX enabled version of ESLint via npm:

    npm i eslint@es6jsx

Please test this out and let us know what you think.

By default, you'll still be in ES5 mode. In order to enable ES6 and/or JSX, you can add that information to your `.eslintrc` file. See the [documentation](https://github.com/eslint/eslint/tree/es6jsx/docs/configuring#specifying-language-options
) for more information.

**Note:** This is not a production-ready version of ESLint. This is a prerelease version to gather feedback. Please don't incorporate this version into your build system.

## How you can help

We could use your help to make progress on adding ES6 and JSX support to ESLint:

* There are still many tests that are failing due to incompatibilities between Esprima 1.2.2 and the latest version, upon which Facebook's Esprima fork is based. We've opened [an issue](https://code.google.com/p/esprima/issues/detail?id=607) with Esprima that we need help resolving one way or another. If you, or someone you know, works on Esprima, please help us push this to a conclusion.
* We need [more tests](https://github.com/eslint/eslint/blob/es6jsx/tests/lib/eslint.js#L2340) to verify that our support is complete and functioning as intended.
* File issues for anything in the `es6jsx` release that doesn't seem to work correctly.
* We depend heavily on [escope](https://github.com/Constellation/escope/) for calculating correct variable scoping. Before rules like `no-unused-vars` can work correctly, `escope` needs to be updated to [support ES6](https://github.com/Constellation/escope/issues/33). Once that happens, we can work with others to create a fork that adds in scoping information for JSX.

## When will it be done?

We would like to ship a version of ESLint that supports ES6 and JSX syntax before the end of the year. It's likely that we'll need to include incremental support for both, so the first official release will likely just feature the ability to parse ES6 and JSX without throwing syntax errors. We'll need to continue working on adding variable scoping and other capabilities over time.

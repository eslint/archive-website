---
title: "The future of TypeScript on ESLint"
tags:
  - typescript
  - parser
author: nzakas
---

A couple of weeks ago, the TypeScript team shared their [roadmap](https://github.com/Microsoft/TypeScript/issues/29288) in which they described formally adopting ESLint in their repo and working to improve TypeScript compatibility for ESLint:

> ## Linting
>
> * Semantic rules in ESLint
>     * Parity with TSLint
>     * Speed & scalability
> * Editor integration for ESLint
>
>In a survey we ran in VS Code a few months back, the most frequent theme we heard from users was that the linting experience left much to be desired. Since part of our team is dedicated to editing experiences in JavaScript, our editor team set out to add support for both TSLint and ESLint. However, we noticed that there were a few architectural issues with the way TSLint rules operate that impacted performance. Fixing TSLint to operate more efficiently would require a different API which would break existing rules (unless an interop API was built like what wotan provides).
>
>Meanwhile, ESLint already has the more-performant architecture we're looking for from a linter. Additionally, different communities of users often have lint rules (e.g. rules for React Hooks or Vue) that are built for ESLint, but not TSLint.
>
>Given this, our editor team will be focusing on leveraging ESLint rather than duplicating work. For scenarios that ESLint currently doesn't cover (e.g. semantic linting or program-wide linting), we'll be working on sending contributions to bring ESLint's TypeScript support to parity with TSLint. As an initial testbed of how this works in practice, we'll be switching the TypeScript repository over to using ESLint, and sending any new rules upstream.

We, just like a lot of the JavaScript and TypeScript communities, were very excited about this announcement. Several members of the ESLint team have been working on improving TypeScript compatibility over the past couple of years, including James Henry, Kai Cataldo, Kevin Partington, Toru Nagashima, and Nicholas Zakas. That work focused mainly on the TypeScript parser, [`typescript-eslint-parser`](https://github.com/eslint/typescript-eslint-parser) (and partly on [`eslint-plugin-typescript`](https://github.com/bradzacher/eslint-plugin-typescript), which was not maintained by the ESLint team but had been maintained by Nicholas and James until recently). The Typescript parser would undoubtedly become the centerpiece of the TypeScript-in-ESLint story going forward; as such, we wanted to make sure that it would be properly maintained.

## Announcing the `typescript-eslint` project

James Henry, who has long been the driving force behind TypeScript compatibility for ESLint, has started the [`typescript-eslint`](https://github.com/typescript-eslint/typescript-eslint) project as a centralized repository for all things related to TypeScript ESLint compatibility. This will be the new home of the TypeScript parser, `eslint-plugin-typescript`, and any other utilities that will make the TypeScript ESLint experience as seamless as possible.

While the ESLint team won't be formally involved in the new project, we are fully supportive of James' efforts and will be keeping lines of communication open to ensure the best ESLint experience for TypeScript developers.

## What this means going forward

1. The ESLint team will no longer be maintaining `typescript-eslint-parser`
    * The repository will be archived as of today
    * There will be no further releases of `typescript-eslint-parser` on npm
2. Anyone using `typescript-eslint-parser` should use `@typescript-eslint/parser` instead
3. Those interested in how TypeScript support is coming along should follow the `typescript-eslint` repository

Once again, we are very excited to welcome the TypeScript community into the ESLint community and look forward to seeing how James and the `typescript-eslint` team make ESLint the best choice for linting TypeScript code.
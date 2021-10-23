---
title: Espree v3.0.0 Alpha 1 released
tags:
  - release
  - breaking
  - alpha
authors: nzakas, kaicataldo
---

We are pleased to share that we've just pushed the first alpha release of Espree v3.0.0. This is a major release with breaking changes, so please be sure to read this post thoroughly.

## Installation

Since Espree v3.0.0 is a prerelease version, you'll need to install it using the `@next` tag:

```
$ npm install espree@next
```

The `@latest` tag is still on the latest v2.x version of Espree.

**Note:** We are providing this release to gather feedback. Help out by [filing issues](https://github.com/eslint/espree/issues/new) if you find a problem.

## Highlights

Here are some highlights of changes in this release.

### Based on Acorn

It was never our intention to maintain another JavaScript parser. When Espree was first introduced, Esprima development had stopped and it seemed like something need to fill that void. We forked Esprima to start Espree, and development went on from there. However, Esprima started development again and we resolved to fold Espree back into Esprima at some point. One of the big sticking points was the ability to switch on and off different language features. While such a capability was on the roadmap, it was very far off in the future, and we needed to make a decision.

Ultimately, we found that Acorn already supported the hooks we'd need to generate the same output as Esprima and Espree. Since we didn't want to continue maintaining a standalone parser, the decision was made to build Espree on top of Acorn. Effectively, Espree is an adapter that produces Esprima output directly from Acorn. This allows us to both continue development on Espree to turn off and on the language features individually as well as to contribute back to one of primary open source JavaScript parsers.

This switch took a lot of time and effort, and huge thanks go to [Ingvar Stepanyan](https://twitter.com/rreverser) for all of his help in making this happen by both contributing code directly to Espree and for helping to fix bugs on Acorn.

### AST and Output Differences

Because Acorn works a bit differently than Esprima, there are some changes to the output. These changes are relatively minor and have been verified to not cause problems in ESLint, so we are hopeful that these changes also will have little effect on other consumers.

1. Additional `start` and `end` properties on nodes and tokens. Acorn uses these internally as part of the parsing routine and attempts to remove or make them nonenumerable resulted in a performance hit. As such, we decided to just leave these properties. They correspond exactly to the two values in the `range` array.
1. The end of each node is now considered the location of the last token. Esprima and Espree v2.x included trailing whitespace in the range of a node, but Acorn and Espree v3.x don't.
1. Error messages are different. Instead of trying to replicate the error messages from Esprima, Espree v3.x just uses the Acorn messages. The error object formats are the same, it's just the actual text of the message that is different.

## Bug Fixes

* Fix: ('...') should parse [#202](https://github.com/eslint/espree/issues/202)
* Fix: MetaProperty should have two Identifiers [#206](https://github.com/eslint/espree/issues/206)
* Fix: generator + computed property method is parsed as none computed. [#207](https://github.com/eslint/espree/issues/207)
* Fix: parse unicode escapes in identifiers (fixes [#181](https://github.com/eslint/espree/issues/181)) (Nicholas C. Zakas)
* Fix: Ensure object rest works in destructed arg (fixes [#213](https://github.com/eslint/espree/issues/213)) (Nicholas C. Zakas)

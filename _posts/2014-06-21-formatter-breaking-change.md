---
title: Formatter Breaking Change
tags:
  - breaking change
  - formatter
authors: nzakas, kaicataldo
---

In the next minor release of ESLint (which will be 0.7.1 due to us incorrectly pushing 0.6.2 as 0.7.0 last month), there will be a breaking change to the way formatters operate.

## What's Changing

Up until this point, formatters were passed a `config` object that contained the calculated severity for each rule (error or warning) so that this information could be output. With 0.7.1, the severity will now be represented on each message itself as a `severity` property. All of the built-in formatters have been updated to reflect this change.

## Why Change?

There were several bugs related to rules being output with the incorrect severity. The most recent was [#983](https://github.com/eslint/eslint/issues/983), which led to the discovery that the config object being passed around didn't take into account inline rule severity changes. [#985](https://github.com/eslint/eslint/pull/985) implemented a change that placed the severity of the message directly onto the message object, meaning the config object was no longer necessary.

The original plan was to deprecate the usage of the config object in formatters for 0.7.1 and remove it in 0.8.0. However, a major refactoring ([#1013](https://github.com/eslint/eslint/pull/1013)) led to a separation of responsibilities that made keeping this functionality as-is extremely difficult.

## What You Have To Do

If you have written a custom formatter for ESLint, then you'll need to change it to reflect this change. Previously, you may have been calculating severity like this:

```js
var severity = config.rules[message.ruleId][0] || config.rules[message.ruleId];
```

To work with 0.7.1, you'll have to use the `severity` on the message itself:

```js
var severity = message.severity;
```

If you want your formatter to work with both old and new versions of ESLint, then you'll need to combine these ways of calculating severity, such as:

```js
var severity = "severity" in message ? message.severity :
        (config.rules[message.ruleId][0] || config.rules[message.ruleId]);
```

## Known Affected Modules

The following is a list of modules available on [npm](https://npmjs.org) that are affected by this change:

* [eslint-stylish](https://www.npmjs.org/package/eslint-stylish)
* [eslint-json](https://www.npmjs.org/package/eslint-json)
* [eslint-tap](https://www.npmjs.org/package/eslint-tap)
* [eslint-path-reporter](https://www.npmjs.org/package/eslint-path-formatter)

Note that this list is not exhaustive. You should check any non-bundled ESLint formatters you may be using for compatibility.

## Questions?

If you have further questions about this change, please contact the [mailing list](https://groups.google.com/group/eslint).

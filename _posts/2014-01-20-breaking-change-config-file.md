---
layout: post
title: Breaking change to ESLint config files
teaser: "In the next version of ESLint, there is a breaking change to remove the capability to use JavaScript files as configuration files. All configuration files must be in JSON format."
tags:
  - breaking change
  - config file
authors:
  - nzakas
  - kaicataldo
categories:
  - API Changes
---

In previous versions of ESLint, it was possible to use JavaScript files as configuration files on the command line, such as:

```
eslint -c config.js file-to-lint.js
```

Configuration files written in JavaScript looked like this:

```js
module.exports = {

    rules: {
        semi: 2
    }
};
```

The capability to use JavaScript files as configuration files is being removed in version 0.3.0. All configuration files must be in JSON format from now on.

## Why the change?

The ability to use JavaScript configuration files was an unintended consequence of using `require()` as a shortcut for loading JSON files. Because `require()` will automatically parse files ending with a `.json` extension into JSON objects, this shortcut was used as a convenience. Unfortunately, this also limited the ability to name configuration files with a different extension (see [related issue](https://github.com/eslint/eslint/issues/486)).

Since JavaScript configuration files were never officially supported, and JSON files are supposed to be the format of choice for configuration files in ESLint, we made the decision to remove the capability to use JavaScript configuration files. Moving away from using `require()` means that all configuration files will be parsed as JSON.

## What do you have to do?

If you have been using a JavaScript configuration file for ESLint, please convert it to a JSON file instead.

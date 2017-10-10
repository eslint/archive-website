---
title: Getting Started
layout: doc
---

# Getting Started with ESLint

ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code, with the goal of making code more consistent and avoiding bugs. In many ways, it is similar to JSLint and JSHint with a few exceptions:

* ESLint uses [Espree](https://github.com/eslint/espree) for JavaScript parsing.
* ESLint uses an AST to evaluate patterns in code.
* ESLint is completely pluggable, every single rule is a plugin and you can add more at runtime.

## Installation

You can install ESLint using npm:

    npm install -g eslint

## Usage

If it's your first time using ESLint, you should set up a config file using `--init`:

    eslint --init

After that, you can run ESLint on any JavaScript file:

    eslint test.js test2.js

## Configuration

**Note:** If you are coming from a version before 1.0.0 please see the [migration guide](https://eslint.org/docs/user-guide/migrating-to-1.0.0).

After running `eslint --init`, you'll have a `.eslintrc` file in your directory. In it, you'll see some rules configured like this:

```json
{
    "rules": {
        "semi": [2, "always"],
        "quotes": [2, "double"]
    }
}
```

The names `"semi"` and `"quotes"` are the names of [rules](https://eslint.org/docs/rules) in ESLint. The number is the error level of the rule and can be one of the three values:

* `0` - turn the rule off
* `1` - turn the rule on as a warning (doesn't affect exit code)
* `2` - turn the rule on as an error (exit code will be 1)

The three error levels allow you fine-grained control over how ESLint applies rules (for more configuration options and details, see the [configuration docs](https://eslint.org/docs/user-guide/configuring)).

Your `.eslintrc` configuration file will also include the line:

```json
    "extends": "eslint:recommended"
```

Because of this this line, all of the rules marked "(recommended)" on the [rules page](https://eslint.org/docs/rules) will be turned on.  Alternatively, you can use configurations that others have created by searching for "eslint-config" on [npmjs.com](https://www.npmjs.com/search?q=eslint-config).  ESLint will not lint your code unless you extend from a shared configuration or explicitly turn rules on in your configuration.

---

## Next Steps

* Learn about [advanced configuration](https://eslint.org/docs/user-guide/configuring) of ESLint.
* Explore [ESLint integrations](https://eslint.org/docs/user-guide/integrations) into other tools like editors, build systems, and more.
* Can't find just the right rule?  Make your own [custom rule](https://eslint.org/docs/developer-guide/working-with-rules).
* Make ESLint even better by [contributing](https://eslint.org/docs/developer-guide/contributing).

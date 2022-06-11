# ESLint Fixers

ESLint is a powerful tool for finding problems in a codebase. Across the ecosystem there exists thousands of rules to help alert you to a wide variety of problems. Some of these rules are built to be more than just reporters - they also include fixers. What is a fixer? Simply put, a fixer can automatically change your code to correct a reported issue.


## The `--fix` Flag

There are a number of different ways to apply fixers to your codebase. One way is to [use the `--fix` flag](https://eslint.org/docs/user-guide/command-line-interface#--fix) from the ESLint CLI. This will apply every available fixer for each reported problem; meaning it is a great way to help ensure your code is correct before making a commit.

If you want some more granularity you can also [use the `--fix-type` flag](https://eslint.org/docs/user-guide/command-line-interface#--fix-type) to limit the types of rules you want to apply fixers for.

It’s worth noting that using the `--fix` flag has an added bonus in that ESLint will perform multiple runs on your codebase until everything is fixed. This can be helpful in case a fixer causes a different lint problem - ESLint will silently apply fixers until the codebase settles, saving you from having to manually redo your lint run.


## Manual Fixes in Your IDE

A more granular approach is to leverage your [IDE integration](https://eslint.org/docs/user-guide/integrations#editors) to selectively apply fixers as you code. Most IDEs will expose a “quick action” or “quick fix” menu which allows you to manually choose to apply the fixer when an problem is reported.

For example in VSCode when [using the `vscode-eslint` extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) you can use the “Quick Fix…” menu to apply the fixer for just the specific problem you’re inspecting:

<p align="center">
  <img src="https://i.imgur.com/Xyvs6Yv.gif" align="center">
</p>

Unlike the CLI approach this offers a very granular way to pick and choose which problems to fix automatically! However the experience here can be quite slow and cumbersome if you have many fixers to apply - doubly so if those fixes cause other problems that themselves need fixing!


## Autofix-on-Save

Most IDE integrations also offer the option to run any fixers on save (usually called “autofix-on-save”) - as if you had used the `--fix` flag. For example in VSCode you can turn this on with the following IDE config:

```
"editor.codeActionsOnSave": {
  "source.fixAll.eslint": true
}
```

Autofix-on-save is a great way to ensure your code is always in a good state; it helps reduce mental overload as you work because you can focus more on your code and only address problems that remain after saving. For example if your codebase uses stylistic rules like [`indent`](https://eslint.org/docs/rules/indent), [`semi`](https://eslint.org/docs/rules/semi), or [`curly`](https://eslint.org/docs/rules/curly) - you will never need to manually fix them again!

However, unlike the `--fix` flag, autofix-on-save can cause some problems in your development workflow. If you ever save some unfinished code, you might accidentally apply some changes that get in the way of your development!

For example, imagine you wrote some code like in the video above and then you save the file, fully intending to write to the variable after saving. Even though the rule and its fix was _technically_ correct, the fix has now gotten in your way by making an unintended change to your code! This can be quite frustrating, and is the opposite of helpful!

This pain often leads people down one of two routes: (1) turn off autofix-on-save altogether, or (2) try to save less frequently with “finished” code; neither of which are positive changes!


## Autofix-on-Save with an Allow/Ban List

Thankfully in some IDE extensions you can improve the experience. These IDE extensions allow you to configure allow/ban lists of lint rules that may or may not be applied during autofix-on-save.

For example in VSCode you can control the list of rules using the [`eslint.codeActionsOnSave.rules`](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint#settings-options) config option. For example the following config will specifically ban the [`prefer-const`](https://eslint.org/docs/rules/prefer-const) rule from running whilst still allowing all other fixers to be applied during autofix-on-save:

```
"eslint.codeActionsOnSave.rules": [
  "!prefer-const",
  “*”
]
```

By curating a list of banned/allowed lint rules you can strike a balance between the power and productivity wins provided by autofix-on-save, without running into any frustrating, accidental changes caused by fixing unfinished code.

There are no hard-or-fast rules around what rules you should/should not allowlist - the exact list will depend on your coding style, personal preference, as well as the set of rules and plugins that you use to lint your project.

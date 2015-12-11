---
title: New Rules
layout: doc
---
# New Rules

ESLint is all about rules. For most of the project's lifetime, we've had over 100 rules, and that list continues to grow. However, we can't just accept any proposed rule because all rules need to work cohesively together. As such, we have some guidelines around which rules can be part of the ESLint core and which are better off as custom rules and plugins.

## Core Rule Guidelines

In general, ESLint core rules must be:

1. **Widely applicable.** The rules we distribute need to be of importance to a large number of developers. Individual preferences for uncommon patterns are not supported.
1. **Generic.** Rules cannot be so specific that users will have trouble understanding when to use them. A rule is typically too specific if describing what it does requires more than two "and"s (if a and b and c and d, then this rule warns).
1. **Atomic.** Rules must function completely on their own. Rules are expressly forbidden from knowing about the state or presence of other rules.
1. **Unique.** No two rules can produce the same warning. Overlapping rules confuse end users and there is an expectation that core ESLint rules do not overlap.
1. **Library agnostic.** Rules must be based solely on JavaScript runtime environments and not on specific libraries or frameworks. For example, core rules shouldn't only apply if you're using jQuery but we may have some rules that apply only if you're using Node.js (a runtime).
1. **No conflicts.** No rule must directly conflict with another rule. For example, if we have a rule requiring semicolons, we cannot also have a rule disallowing semicolons (which is why we have one rule, `semi`, that does both).

Even though these are the formal criteria for inclusion, each rule is evaluated on its own basis.

## Proposing a Rule

If you want to propose a new rule, [create an issue](https://github.com/eslint/eslint/issues/new?body=**When%20does%20this%20rule%20warn%3F%20Please%20describe%20and%20show%20example%20code%3A**%0A%0A**Is%20this%20rule%20preventing%20an%20error%20or%20is%20it%20stylistic%3F**%0A%0A**Why%20is%20this%20rule%20a%20candidate%20for%20inclusion%20instead%20of%20creating%20a%20custom%20rule%3F**%0A%0A**Are%20you%20willing%20to%20create%20the%20rule%20yourself%3F**%0A%0A) be sure to include:

1. When the rules will warn. Include a description as well as sample code.
1. Whether the rule prevents an error or is stylistic.
1. Why the rule should be in the core instead of creating a custom rule.
1. Are you willing to create the rule yourself?

We need all of this information in order to determine whether or not the rule is a good core rule candidate.

## Resource Limitations

Please keep in mind that we receive a lot of rule proposals and the ESLint team is completely a volunteer team that works in its free time to maintain ESLint. As a result, even if we like the idea for a rule, we may not have the resources to implement it. You greatly increase the likelihood of getting a new core rule into ESLint if you are willing to implement it yourself. The team is very good at guiding first-time contributors through the rule creation process.

## Creating Your Own Rules

Remember that ESLint is completely pluggable, which means you can create your own rules and distribute them using plugins. We did this on purpose because we don't want to be the gatekeepers for all possible rules. Even if we don't accept a rule into the core, that doesn't mean you can't have the exact rule that you want. See the [working with rules](../working-with-rules) and [working with plugins](../working-with-plugins) documentation for more information.

---
layout: post
title: Changes to Issue and Pull Request Policies
tags:
  - release
  - minor
---
# Changes to Issue and Pull Request Policies

We've recently made some changes to our policies around issues and pull requests that we're happy to share with you.

From the beginning of the project, ESLint has always required issues for every pull request containing code. There were a number of reasons for that, mostly related to how we were triaging and handling incoming requests as well as the limitations the GitHub issue tracker imposed on us. Since that time, there have been a lot of improvements to the GitHub issue and pull request trackers, and as such, we've been able to make some changes.

## Most Pull Requests No Longer Require Issues

We've lifted the restriction that all pull requests require issues. For almost all types of changes, you can now submit pull requests directly without an issue. We've added a pull request template, and as long as you fill out the required information in that template, you can feel free to submit pull requests without opening issues first.

There are, however, two types of changes that still require issues:

1. Any breaking change.
1. Any changes to the core.

Breaking and core changes have a high potential to affect end-users, and so we still want to understand that impact before people spend time writing code.

## End-of-Life Periods for Issues

One of the things we've heard from contributors is that it's frustrating when an issue gets stuck without resolution. We've tried, from the start, to give feedback as quickly as possible to issues and pull requests. However, as ESLint has grown, the number of issues and pull requests has grown quite large and has made it hard for the team to handle.

Different teams in the open source community handle this problem differently. Some teams choose to never close issues and just leave all of them open indefinitely in case someone wants to fix them. Some teams use bots to automatically close issues that are older than a set amount of time. The ESLint team wasn't too happy with these choices, so we arrived on a more manual process that is a mixture of the two.

Our top goal is to give feedback quickly, and since most issues are requests for the ESLint team to make a change, we want to let you know whether or not we'll be making that change. The best way to do that is to close the issue with an appropriate comment. The rules we've established are:

1. An issue that hasn't been accepted may be closed after 21 days. (Only accepted issues end up on the roadmap.)
2. An accepted issue may be closed after 90 days if no one has agreed to implement it.

While we wish we could commit to implementing every good idea for ESLint, the reality is that many requests will not end up on the formal roadmap. The ESLint team is a team of volunteers working in their spare time, and as such, the amount of time available for work is small. We feel that closing issues and giving a clear indication that the requested change will not be made is a more honest approach than leaving issues open forever just in case someone decides they'd like to contribute a change. In our experience, issues that are open for 90 days or more are rarely ever addressed and just serve to confuse everyone about their status.

**Note:** If you're passionate about a change, consider submitting a pull request instead of an issue. A lot of times, we just don't have the extra bandwidth to accommodate significant requests, but we can guide others through the changes. Submitting a pull request increases the chances that your change will land (though it does not guarantee it).

## Continuing to Learn

As always, we'll continue to evaluate our issue and pull request policies based on feedback from the ESLint team and the community as a whole. We hope these new changes will help the ESLint community continue to grow by streamlining the process for accepting contributions.

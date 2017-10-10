---
layout: post
title: JSCS End of Life
tags:
  - jscs
  - end of life
---
# JSCS End of Life

When we announced that [JSCS was joining ESLint](https://eslint.org/blog/2016/04/welcoming-jscs-to-eslint), it was with a stated support period for JSCS of three months. Those three months have now passed and JSCS is now considered fully deprecated.

## What End of Life Means

The end of life for JSCS means:

1. We will no longer be evaluating issues on JSCS
2. Pull requests to JSCS will no longer be reviewed or merged
3. There will be no further JSCS releases
4. The JSCS GitHub repo will remain available as an archive of the JSCS source code
5. The JSCS website will remain available as an archive of JSCS documentation
6. Existing versions of JSCS will continue to be available and functional

The JSCS developers will now be focusing their time and energy on ESLint, including JSCS compatibility issues.

## JSCS Compatibility in ESLint

We have setup a [milestone](https://github.com/eslint/eslint/milestone/15) for tracking all of our JSCS compatibility issues. At the time of this post, we are at 20% complete and are continuing to make progress. If you're a JSCS user, we can use your help to make sure you have the best possible experience when switching to ESLint. Please feel free to review the issues in our milestone and add your thoughts (or submit a pull request).

Our plan is to continue prioritizing JSCS compatibility work over everything else until complete. We're also working on documentation and tooling to help automate the switch from JSCS to ESLint. We recommend holding off on switching from JSCS to ESLint until most of the compatibility work has been completed (we will make an announcement when that happens).

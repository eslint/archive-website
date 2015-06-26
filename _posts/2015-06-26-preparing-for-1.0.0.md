---
layout: post
title: Preparing for 1.0.0
tags:
  - release
  - announcement
---
# Preparing for 1.0.0

With 0.24.0 being released, we're now preparing for the 1.0.0 release. This has been a long time coming, and we're excited to be taking this important step. Here's a brief overview of what will happen next.

## Creation of 0.x Branch

The `0.x` branch on the public repo is a record of the last release of the 0.x version tree. The `master` branch will be the work for 1.0.0. If bug fixes or other changes are needed before 1.0.0 is ready, then those changes will be cherry-picked onto the `0.x` branch and a release will be made from that.

We do not plan on having a 0.25.0 release - this will only happen if 1.0.0 is significantly delayed.

## 1.0.0 Release Candidates

Because 1.0.0 is a major release with significant breaking changes, we will be doing several release candidates before finalizing the 1.0.0 release. We will do this periodically as changes are being merged. The intent is to give everyone a chance to try out the upgrade path and provide feedback. Release candidate version will be appended with `rc-` to indicate that these are not considered production-ready.

## 1.0.0 Migration Docs

With each release candidate, we will update migrations documentation. The jump from 0.24.0 to 1.0.0 is a big one, and we're looking for your feedback to help make the transition smooth. The first draft of the migration docs will come out with the first release candidate.

## Your Feedback Matters

We know you've come to rely on ESLint for maintaining the quality of your code, so your feedback is really important in this process. Please contact us as frequently as necessary to get your questions answers and to let us know how the upgrade is going for you.

---
layout: post
title: The inception of ESLint
teaser: The story of how one bug at work spawned the pluggable linter.
authors:
  - nzakas
categories:
  - Storytime
original:
  url: https://humanwhocodes.com/blog/2018/02/the-inception-of-eslint/
  date: 2018-02-27
  site:
    name: Human Who Codes Tech Blog
    url: https://humanwhocodes.com/
---

If you're like me, you probably use a lot of open source tools every day without thinking about how they got started. Few projects share the "why" of their creation: the actual problem they were trying to solve and when they first came across that problem. You can, of course, benefit from open source projects without understanding their origin story, but I always find it interesting to hear about how it all started.

I recently realized that I'd never shared the origin story of ESLint. I've shared some of the decisions I made along the way in previous posts but never the initial domino that fell and led to ESLint's creation. As you will see, ESLint wasn't created through some divine intervention or stroke of insight, but rather through a series of events that eventually built up to ESLint's creation.

## The bug

I was still fairly new at Box when a teammate was working on a strange bug. A client had reported problems using the web application in Internet Explorer 7 (we were probably one of the last companies supporting IE7 at that point). A developer had apparently used the native `XMLHttpRequest` object in some JavaScript code instead of our in-house wrapper. This wasn't a problem for any other browser, and there wasn't a problem testing with IE7 internally. The problem occurred because the client had an internal security policy that disabled ActiveX in Internet Explorer, and since the native `XMLHttpRequest` object in IE7 was really just a wrapper around the ActiveX object, it was blocked as well.

The solution was easy enough, just make sure everyone knows to use the in-house Ajax wrapper instead of the native `XMLHttpRequest` object. But how could we enforce this? It turned out that Box had a JavaScript "linter" as part of the build system. I put the word linter in quotes because it was really just a series of regular expressions that were run against JavaScript code. For this case, my teammate added a regular expression for "XMLHttpRequest" and that was the solution. The build would break going forward if someone tried to commit a JavaScript file matching that pattern.

In my experience, using regular expressions on source code was never a good idea. I wished that there was a better way to do checks like this one during the build. I figured that someone must have already solved this problem and so I started looking for solutions.

## Could it be JSHint?

The first thing I did was email the maintainer of JSHint at that time, Anton Kovalyov[1]. I had remembered reading a blog post[2] that said JSHint was planning to support plugins but couldn't find any information about that feature being implemented. From past experience contributing to JSHint and from modifying JSLint for a project at Yahoo, I knew JSHint hadn't initially been setup to support plugins, and without formal support there wouldn't be an easy way to modify JSHint to do what I wanted.

Anton informed me that the plugin proposal had stalled and didn't look like it would be implemented. I was disappointed, as this seemed like the most direct path to solving the problem. I thanked him and asked him to please not be offended if I create a linter that did what I needed. I wanted to support JSHint, but I felt like this was a problem that needed to be solved with JSHint or without it.

## The inspiration

After digging around in the build system at Box, I found there was actually a PHP linter running in addition to the makeshift JavaScript linter. The PHP linter, however, was a lot more involved that the JavaScript one. Instead of using regular expressions, the PHP linter parsed the code into an abstract syntax tree (AST) and then inspected the AST for the patterns to report.

I was probably shaking my head "yes" as I read through that code. Immediately I realized that this was exactly what I needed to do for JavaScript. If only there was some way to parse JavaScript into an AST and then inspect the AST for problems.

## The groundwork

With all of this floating around in my brain, I invited Ariya Hidayat[3] to give a talk at Box about whatever topic he pleased. It just so happened that he gave a talk on Esprima[4], the JavaScript parser he wrote in JavaScript. During that talk, Ariya discussed why having an AST representation of JavaScript was useful and referenced several already-existing tools built on top of Esprima. Among those tools were estraverse for traversing the AST and escope for scope analysis, both written by Yusuke Suzuki.

As Ariya continued talking and giving examples of the types of problems an AST can solve, the idea for a new tool formed in my head. It made sense to me that there should be one tool that could perform all of the evaluations Ariya mentioned. After all, they are all just using the AST for different purposes. Why not have one AST they all can use?

## The beginning

Thanks largely to the availability of Esprima, estraverse, and escope, I was able to put together the first prototype of ESLint over a couple of weekends. To me, these three utilities represented everything that I needed to create a new tool that could easily find problem patterns in JavaScript code. If I had to create those from scratch, I have no doubt that ESLint would not exist today. Building on top of those tools, I was able to iterate quickly, and eventually, the tool you know today as ESLint was born.

(I feel it's important to point out that I was not the only one looking to create an AST-based linter at the time. JSCS[5] was also under development at around the same time, and current ESLint maintainer Ilya Volodin was working on his own project before discovering ESLint. If I had not come up with something like ESLint then someone else undoubtedly would have. All of the pieces were already out there thanks to Ariya and Yusuke, someone just had to put them together in a useful way.)


## References

1. [Anton Kovalyov](https://www.antonkovalyov.com/) (antonkovalyov.com)
1. [JSHint 3 Plans](http://jshint.com/blog/jshint-3-plans/) (jshint.com)
1. [Ariya Hidayat](https://ariya.io) (ariya.io)
1. [JavaScript Code Analysis](https://speakerdeck.com/ariya/javascript-code-analysis) (speakerdeck.com)
1. [JSCS](http://jscs.info/) (jscs.info)

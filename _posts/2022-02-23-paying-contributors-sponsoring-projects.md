---
layout: post
title: "Paying contributors, sponsoring projects, and more: ESLint's 2022 spending plan"
teaser: "When ESLint first started accepting donations, we weren't quite sure how to fairly distribute the proceeds. Now, three years into accepting donations, we've settled on a plan for how to use our funds for the betterment of the ESLint project and ecosystem."
tags:
  - Sponsorships
  - Donations
  - Contributors
  - Sustainability
authors:
  - nzakas
categories:
  - Financials
---

In our [last update on paying contributors](https://eslint.org/blog/2020/10/year-paying-contributors-review), we noted some of the successes and challenges we had as a team. At that time, we were still trying to figure out ESLint's model for sustainability. Having money to spend is one thing but knowing how to best use that money is another. Because we didn't have enough money to pay anyone full time, we tried one maintainer at part time, and that didn't work. After that experiment, we decided to regroup and reevaluate, ultimately deciding to use a per-hour payment system for team members.

Once we settled into the per-hour system, that also gave us information on how many hours each month people were spending on the project. That, in turn, showed us how much money we actually needed each month to continue maintaining ESLint. As a result of that information, we have arrived at a system that we are very pleased with.

## The guiding principle

Before explaining how ESLint is using the money it collects now, it helps to take a step back to understand the guiding principles upon which this approach is based. Each project has different goals for why they are raising money and how it should be spent. For many projects, the goal is to allow the maintainer(s) to work full time on the project. That is a worthy goal provided that the maintainers actually want to work full time on the project. This is a narrow approach to distributing funds in that most or all of the money goes to one or a few people. 

On ESLint, we discovered that we didn't have any team members interested in working on the project full time. So we thought: what if we went in the complete opposite direction? Given that we know people will only work part time, and probably just in their spare time, how could we distribute the funds as widely as possible for the maximum positive impact?

When we asked ourselves this question, we realized that we were circling around a common theme: anything that benefits the ESLint ecosystem is worth supporting financially. The first and most obvious thing that benefits the ecosystem is having people maintaining ESLint, so we clearly need to make sure people are paid fairly for spending their time working on the project. But what else benefits the ecosystem? Well, ESLint is built on top of a bunch of dependencies, and we'd like to support those projects, so what if we donated some of our funds to those projects? There's also a wide range of plugins, parsers, and extensions that help fuel use of ESLint, so what if we started sponsoring some of these projects as well? And we also get a bunch of contributions from outside contributors...what if we paid them?

So by aligning around the idea that anything that benefits the ESLint ecosystem is worth funding, we were able to find ways to spread the money we collected more widely, and we're excited to share the results.

## How we are spending our money now

In general, we regularly spend money on the following things.

### Paying team members per hour

Each month, all ESLint team members can submit an invoice for the number of hours they worked on the project. Anything they do on the project counts, whether that is writing code, writing documentation, triaging issues, participating in our Discord server, attending meetings on behalf of ESLint, contributing to our upstream dependencies, and so on. All contributions to an open source project are valuable, and we feel like compensating team members for any time they spend on the project is the right thing to do.

Right now, the per-hour rate for Technical Steering Committee (TSC) members and Reviewers is $80/hour; the per-hour rate for Committers is $50/hour.

### The contributor pool

One of the things we struggled with was how to fairly pay outside contributors for working on ESLint. We didn't think a standard per-hour rate made much sense because 1) people might contribute without knowing to track their hours ahead of time and 2) trusting people you don't know to accurately report their hours spend is a system that is too easy to exploit. Still, we felt like it wasn't fair for us to pay for team member contributions but not for outside contributions, and so we created the contributor pool.

Each month, we set aside $1,000 specifically to give to outside contributors for any contributions to ESLint. The TSC reviews outside contributions at the end of each month and awards at least $100 to every outside contributor who has made a non-trivial contribution to ESLint. Once again, these contributions are not limited to coding, but can be anything that positively impacts the project. The contributors don't need to apply ahead of time or ask for permission; if you make a significant contribution, you'll get an email from the TSC letting you know how to collect your payment.

In 2021, we awarded over $6,000 to outside contributors, and we look forward to awarding more in 2022. The bottom line here: if you make any non-trivial contribution to ESLint, you will get paid for it.

### Supporting our dependencies

As we [announced in 2020](https://eslint.org/blog/2020/09/supporting-eslint-dependencies), we actively seek out and donate to our dependencies. In general, any project we directly depend on that has an Open Collective account will be considered to receive a donation from ESLint. We are currently supporting five of our dependencies with monthly donations of $150:

* [Ajv](https://npmjs.com/package/ajv) is a JSON schema validator that ESLint uses to validate configuration.
* [Eleventy](https://www.11ty.dev/) is a Node.js-based static site generator that we use to create [eslint.org](http://eslint.org).
* [Sindre Sorhus](https://sindresorhus.com/) is a prolific open source developer, and ESLint uses several of his modules, including [`chalk`](https://npmjs.com/package/chalk), [`globals`](https://npmjs.com/package/globals), [`import-fresh`](https://npmjs.com/package/import-fresh), [`strip-ansi`](https://npmjs.com/package/strip-ansi), and [`strip-json-comments`](https://npmjs.com/package/strip-json-comments).
* [debug](https://npmjs.com/package/debug) is a small tool ESLint uses to output debugging messages when you use the `--debug` flag. 
* [lint-staged](https://npmjs.com/package/lint-staged) is a simple precommit hook manager that makes it easy to setup linting in your development process.

We think it's important for open source projects that receive a lot of donations to take care of their dependencies. After all, if your project couldn't exist without those dependencies, then they deserve your support.

You can always check to see which projects ESLint is supporting on our [Open Collective page](https://opencollective.com/eslint#category-CONTRIBUTIONS).

### Supporting the community

Once we started supporting our upstream dependencies, we thought, what about the downstream dependencies? There are a lot of projects related to ESLint that enrich the ESLint ecosystem, whether that be a different set of rules, a custom parser, or anything that makes ESLint better to use. We are currently donating $150 per month to these projects:

* [typescript-eslint](https://github.com/typescript-eslint) is the plugin that makes ESLint work with TypeScript.
* [eslint-plugin-import](https://npmjs.com/package/eslint-plugin-import) is a plugin to help you manage your module imports.
* [eslint-plugin-jsx-a11y](https://npmjs.com/package/eslint-plugin-jsx-a11y) is a plugin to help you ensure your JSX code is accessible.

Going forward, we are looking to continue supporting community projects like these. The strength of ESLint is in the ecosystem built by you, and we want to support as much of that ecosystem as possible.

### Big projects

The last way we decided to spend money is on what we playfully called "big projects." These are projects that take a lot of time and effort, and that the team doesn't have the time, interest, or expertise to accomplish on our own. Every project has a backlog of tasks that seem too big to ever accomplish, and we realized that we could start making our way through that list by hiring professionals to do the work.

The first of our big projects is an ambitious project to redesign the ESLint website. We had wanted to redesign our website for several years, and tried at least three separate times to do it in the spirit of open source, with volunteers and designing by consensus. Each of those times the efforts failed, and so we decided it was time to hire some folks to help us out.

The entire scope of the project is fairly large and includes:

1. A brand design including a logo refresh
1. A new website design that explains more about what ESLint is and how people use it
1. Separating the documentation into its own website that is easier to navigate
1. Separating the demo into its own single-page application to make it easier to maintain and deploy
1. Rewriting and updating our documentation (from scratch)
1. Translating our documentation into different languages

So far, we have finished step 1 and are getting close to finishing step 2. To do this, we hired:

* [JellyPepper](https://jellypepper.com/) for the brand refresh and visual design of the website.
* [Gavin Barnett](https://gavinbarnett.com/) to design our new blog images.
* [Sara Soueidan](https://www.sarasoueidan.com/) to implement the new website, documentation site, and demo skeleton.
* [Cassie Evans](https://www.cassie.codes/) to implement a custom homepage animation.

The total cost of this effort has come to about $46,000 and we are thrilled with how everything has gone. This is a perfect example of where hiring professionals to do the work allowed us to move faster and (soon!) improve the website experience for all ESLint users.

## Wrapping up

It took us a while to figure out the right way to use our sponsorship money, but now that we have, we think we've found the best way to sustain ESLint for the future. Making sure that everyone gets paid for non-trivial contributions was a goal we had from the start and we are happy that we finally figured out a way to do that.

Additionally, moving to a model where we share some of our funds with both our dependencies and other ecosystem projects feels more in the spirit of open source. We are an interconnected ecosystem where projects mix and reuse other projects to create even more interesting projects. Just as we would consider contributing code to projects that help us, we also need to consider donating money to those projects. The ESLint team feels grateful for the funding we have received and equally grateful to our dependencies without which ESLint couldn't exist. We hope that this model will spread to other open source projects as well.

And last, we intend to continue hiring professionals to work on big projects. There are a lot of different aspects to running an open source project, and expecting volunteers to handle all of those aspects in unrealistic. We've had a great experience on the website project (which should be completed in the next few months) and we'll be looking for other ways to create more value for the ESLint community going forward.

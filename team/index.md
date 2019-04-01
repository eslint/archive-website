---
title: Team
layout: doc
edit_link: https://github.com/eslint/eslint.github.io/edit/master/team/index.md
---

# Team

These are the people who build and maintain ESLint.

## Technical Steering Committee

The people who manage releases, review feature requests, and meet regularly to ensure ESLint is properly maintained.

<div class="container-fluid">
    <div class="row">

{% assign tsc = site.data.team.tsc %}
{% for person in tsc %}
    <div class="col-xs-6 col-sm-4 col-md-3 text-center" style="margin-bottom: 2rem">
    <a href="https://github.com/{{ person.username }}"><img src="https://github.com/{{person.username}}.png?s=150" width="150"></a><br>
    {{ person.name }}<br><a href="https://github.com/{{ person.username }}">@{{ person.username }}</a>
    </div>
{% endfor %}

    </div>
</div>

{% assign reviewers = site.data.team.reviewers %}
{% if reviewers.size > 0 %}
## Reviewers

The people who review and implement new features.

<div class="container-fluid">
    <div class="row">

{% for person in reviewers %}
    <div class="col-xs-6 col-sm-4 col-md-3 text-center" style="margin-bottom: 2rem">
    <a href="https://github.com/{{ person.username }}"><img src="https://github.com/{{person.username}}.png?s=150" width="150"></a><br>
    {{ person.name }}<br><a href="https://github.com/{{ person.username }}">@{{ person.username }}</a>
    </div>
{% endfor %}

    </div>
</div>
{% endif %}



{% assign committers = site.data.team.committers %}
{% if committers.size > 0 %}
## Committers

The people who review and fix bugs and help triage issues.

<div class="container-fluid">
    <div class="row">

{% for person in committers %}
    <div class="col-xs-6 col-sm-4 col-md-3 text-center" style="margin-bottom: 2rem">
    <a href="https://github.com/{{ person.username }}"><img src="https://github.com/{{person.username}}.png?s=150" width="150"></a><br>
    {{ person.name }}<br><a href="https://github.com/{{ person.username }}">@{{ person.username }}</a>
    </div>
{% endfor %}

    </div>
</div>
{% endif %}

## Alumni

Former TSC members and committers who previously helped maintain ESLint.

<div class="container-fluid">
    <div class="row">

{% assign alumni = site.data.team.alumni %}
{% for person in alumni %}
    <div class="col-xs-6 col-sm-4 col-md-3 text-center" style="margin-bottom: 2rem">
    <a href="https://github.com/{{ person.username }}"><img src="https://github.com/{{person.username}}.png?s=150" width="150"></a><br>
    {{ person.name }}<br><a href="https://github.com/{{ person.username }}">@{{ person.username }}</a>
    </div>
{% endfor %}

    </div>
</div>

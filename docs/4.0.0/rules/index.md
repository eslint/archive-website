---
title: List of available rules
layout: doc
---

# Rules

Rules in ESLint are grouped by category to help you understand their purpose.

No rules are enabled by default. The `"extends": "eslint:recommended"` property in a [configuration file](../user-guide/configuring#extending-configuration-files) enables rules that report common problems, which have a check mark (recommended) below.

The `--fix` option on the [command line](../user-guide/command-line-interface#fix) automatically fixes problems (currently mostly whitespace) reported by rules which have a wrench (fixable) below.

{% for category in site.data.rules4.categories %}

## {{ category.name}}

{{ category.description }}

<table class="rule-list table table-striped">
<colgroup>
<col class="recommended" />
<col class="fixable" />
<col class="name" />
<col class="description" />
</colgroup>
<tbody>
{% for rule in category.rules %}
<tr>
<td>{% if rule.recommended %}(recommended){% endif %}</td>
<td>{% if rule.fixable %}(fixable){% endif %}</td>
<td markdown="1">[{{rule.name}}]({{rule.name}})
</td>
<td markdown="1">{{rule.description}}
</td>
</tr>
{% endfor %}
</tbody>
</table>

{% endfor %}

{% if site.data.rules.deprecated %}
## {{ site.data.rules.deprecated.name }}

{{ site.data.rules.deprecated.description }}

<div class="rule-list deprecated-rules">
<table class="table table-striped">

<colgroup>
<col class="name" />
<col class="replaced-by" />
</colgroup>

<thead>
<tr>
<th>Deprecated rule</th>
<th>Replaced by</th>
</tr>
</thead>

<tbody>
{% for rule in site.data.rules.deprecated.rules %}
<tr>
<td markdown="1">[{{rule.name}}]({{rule.name}})
</td>
{% if rule.replacedBy.size > 0 %}
<td class="replaced-by" markdown="1">{% for replaced in rule.replacedBy %}[{{replaced}}]({{replaced}}){% endfor %}
{% else %}
<td class="replaced-by" markdown="1"><p class="text-muted">(no replacement)</p>
{% endif %}
</td>
</tr>
{% endfor %}
</tbody>

</table>
</div>
{% endif %}

## {{ site.data.rules.removed.name }}

{{ site.data.rules.removed.description }}

<div class="rule-list removed-rules">
<table class="table table-striped">

<colgroup>
<col class="name" />
<col class="replaced-by" />
</colgroup>

<thead>
<tr>
<th>Removed rule</th>
<th>Replaced by</th>
</tr>
</thead>

<tbody>
{% for rule in site.data.rules.removed.rules %}
<tr>
<td markdown="1">[{{rule.removed}}]({{rule.removed}})
</td>
{% if rule.replacedBy.size > 0 %}
<td class="replaced-by" markdown="1">{% for replaced in rule.replacedBy %}[{{replaced}}]({{replaced}}){% endfor %}
{% else %}
<td class="replaced-by" markdown="1"><p class="text-muted">(no replacement)</p>
{% endif %}
</td>
</tr>
{% endfor %}
</tbody>

</table>
</div>

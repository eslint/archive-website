---
title: List of available rules
layout: doc
---

# Rules

Rules in ESLint are grouped by category to help you understand their purpose.

No rules are enabled by default. The `"extends": "eslint:recommended"` property in a [configuration file](../user-guide/configuring#extending-configuration-files) enables rules that report common problems, which have a check mark (recommended) below.

The `--fix` option on the [command line](../user-guide/command-line-interface#fix) automatically fixes problems (currently mostly whitespace) reported by rules which have a wrench (fixable) below.

{% for category in site.data.rules.categories %}

## {{ category.name}}

{{ category.description }}

<table class="rule-list table">
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

<div class="deprecated-rules" markdown="1">
|Deprecated rule|Replaced by
|---|---
{% for rule in site.data.rules.deprecated.rules %}|[{{rule.name}}]({{rule.name}})| {% for replaced in rule.replacedBy %} [{{replaced}}]({{replaced}}) {% endfor %}
{% endfor %}
</div>
{% endif %}

## {{ site.data.rules.removed.name }}

{{ site.data.rules.removed.description }}

<div class="removed-rules" markdown="1">
|Removed rule|Replaced by
|---|---
{% for rule in site.data.rules.removed.rules %}|[{{rule.removed}}]({{rule.removed}})| {% for replaced in rule.replacedBy %} [{{replaced}}]({{replaced}}) {% endfor %}
{% endfor %}
</div>

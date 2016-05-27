---
title: Documentation
layout: doc
---
# ESLint Formatters

ESLint comes with several built-in formatters to control the appearance of the linting results, and supports third-party formatters as well.

The built-in formatter options are:

* [checkstyle](#checkstyle)
* [compact](#compact)
* [html](#html)
* [jslint-xml](#jslint-xml)
* [json](#json)
* [junit](#junit)
* [stylish](#stylish)
* [table](#table)
* [tap](#tap)
* [unix](#unix)
* [visualstudio](#visualstudio)

## Example Source

Examples of each formatter were created from linting `fullOfProblems.js` using the `.eslintrc` configuration shown below.

### `fullOfProblems.js`

```js
function addOne(i) {
    if (i != NaN) {
        return i ++
    } else {
      return
    }
};
```

### `.eslintrc`:

```json
{
    "extends": "eslint:recommended",
    "rules": {
        "consistent-return": 2,
        "indent"           : [1, 4],
        "no-else-return"   : 1,
        "semi"             : [1, "always"],
        "space-unary-ops"  : 2
    }
}
```

## Output Examples

### checkstyle
```
<?xml version="1.0" encoding="utf-8"?><checkstyle version="4.3"><file name="C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js"><error line="1" column="10" severity="error" message="&apos;addOne&apos; is defined but never used (no-unused-vars)" source="eslint.rules.no-unused-vars" /><error line="2" column="9" severity="error" message="Use the isNaN function to compare with NaN. (use-isnan)" source="eslint.rules.use-isnan" /><error line="3" column="16" severity="error" message="Unexpected space before unary operator &apos;++&apos;. (space-unary-ops)" source="eslint.rules.space-unary-ops" /><error line="3" column="20" severity="warning" message="Missing semicolon. (semi)" source="eslint.rules.semi" /><error line="4" column="12" severity="warning" message="Unexpected &apos;else&apos; after &apos;return&apos;. (no-else-return)" source="eslint.rules.no-else-return" /><error line="5" column="7" severity="warning" message="Expected indentation of 8 space characters but found 6. (indent)" source="eslint.rules.indent" /><error line="5" column="7" severity="error" message="Expected a return value. (consistent-return)" source="eslint.rules.consistent-return" /><error line="5" column="13" severity="warning" message="Missing semicolon. (semi)" source="eslint.rules.semi" /><error line="7" column="2" severity="error" message="Unnecessary semicolon. (no-extra-semi)" source="eslint.rules.no-extra-semi" /></file></checkstyle>
```

### compact
```
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js: line 1, col 10, Error - 'addOne' is defined but never used (no-unused-vars)
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js: line 2, col 9, Error - Use the isNaN function to compare with NaN. (use-isnan)
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js: line 3, col 16, Error - Unexpected space before unary operator '++'. (space-unary-ops)
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js: line 3, col 20, Warning - Missing semicolon. (semi)
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js: line 4, col 12, Warning - Unexpected 'else' after 'return'. (no-else-return)
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js: line 5, col 7, Warning - Expected indentation of 8 space characters but found 6. (indent)
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js: line 5, col 7, Error - Expected a return value. (consistent-return)
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js: line 5, col 13, Warning - Missing semicolon. (semi)
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js: line 7, col 2, Error - Unnecessary semicolon. (no-extra-semi)

9 problems
```

### html
<iframe src="html-formatter-example.html" width="100%" height="460px"></iframe>

### jslint-xml
```
<?xml version="1.0" encoding="utf-8"?><jslint><file name="C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js"><issue line="1" char="10" evidence="function addOne(i) {" reason="&#39;addOne&#39; is defined but never used (no-unused-vars)" /><issue line="2" char="9" evidence="    if (i != NaN) {" reason="Use the isNaN function to compare with NaN. (use-isnan)" /><issue line="3" char="16" evidence="        return i ++" reason="Unexpected space before unary operator &#39;++&#39;. (space-unary-ops)" /><issue line="3" char="20" evidence="        return i ++" reason="Missing semicolon. (semi)" /><issue line="4" char="12" evidence="    } else {" reason="Unexpected &#39;else&#39; after &#39;return&#39;. (no-else-return)" /><issue line="5" char="7" evidence="      return" reason="Expected indentation of 8 space characters but found 6. (indent)" /><issue line="5" char="7" evidence="      return" reason="Expected a return value. (consistent-return)" /><issue line="5" char="13" evidence="      return" reason="Missing semicolon. (semi)" /><issue line="7" char="2" evidence="};" reason="Unnecessary semicolon. (no-extra-semi)" /></file></jslint>
```

### json
```
[{"filePath":"C:\\Users\\Nicholas\\projects\\personal\\eslint\\fullOfProblems.js","messages":[{"ruleId":"no-unused-vars","severity":2,"message":"'addOne' is defined but never used","line":1,"column":10,"nodeType":"Identifier","source":"function addOne(i) {"},{"ruleId":"use-isnan","severity":2,"message":"Use the isNaN function to compare with NaN.","line":2,"column":9,"nodeType":"BinaryExpression","source":"    if (i != NaN) {"},{"ruleId":"space-unary-ops","severity":2,"message":"Unexpected space before unary operator '++'.","line":3,"column":16,"nodeType":"UpdateExpression","source":"        return i ++","fix":{"range":[57,58],"text":""}},{"ruleId":"semi","severity":1,"message":"Missing semicolon.","line":3,"column":20,"nodeType":"ReturnStatement","source":"        return i ++","fix":{"range":[60,60],"text":";"}},{"ruleId":"no-else-return","severity":1,"message":"Unexpected 'else' after 'return'.","line":4,"column":12,"nodeType":"BlockStatement","source":"    } else {"},{"ruleId":"indent","severity":1,"message":"Expected indentation of 8 space characters but found 6.","line":5,"column":7,"nodeType":"ReturnStatement","source":"      return","fix":{"range":[80,80],"text":"  "}},{"ruleId":"consistent-return","severity":2,"message":"Expected a return value.","line":5,"column":7,"nodeType":"ReturnStatement","source":"      return"},{"ruleId":"semi","severity":1,"message":"Missing semicolon.","line":5,"column":13,"nodeType":"ReturnStatement","source":"      return","fix":{"range":[86,86],"text":";"}},{"ruleId":"no-extra-semi","severity":2,"message":"Unnecessary semicolon.","line":7,"column":2,"nodeType":"EmptyStatement","source":"};","fix":{"range":[94,95],"text":""}}],"errorCount":5,"warningCount":4}]
```

### junit
```
<?xml version="1.0" encoding="utf-8"?>
<testsuites>
<testsuite package="org.eslint" time="0" tests="9" errors="9" name="C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js">
<testcase time="0" name="org.eslint.no-unused-vars"><failure message="&#39;addOne&#39; is defined but never used"><![CDATA[line 1, col 10, Error - &#39;addOne&#39; is defined but never used (no-unused-vars)]]></failure></testcase>
<testcase time="0" name="org.eslint.use-isnan"><failure message="Use the isNaN function to compare with NaN."><![CDATA[line 2, col 9, Error - Use the isNaN function to compare with NaN. (use-isnan)]]></failure></testcase>
<testcase time="0" name="org.eslint.space-unary-ops"><failure message="Unexpected space before unary operator &#39;++&#39;."><![CDATA[line 3, col 16, Error - Unexpected space before unary operator &#39;++&#39;. (space-unary-ops)]]></failure></testcase>
<testcase time="0" name="org.eslint.semi"><failure message="Missing semicolon."><![CDATA[line 3, col 20, Warning - Missing semicolon. (semi)]]></failure></testcase>
<testcase time="0" name="org.eslint.no-else-return"><failure message="Unexpected &#39;else&#39; after &#39;return&#39;."><![CDATA[line 4, col 12, Warning - Unexpected &#39;else&#39; after &#39;return&#39;. (no-else-return)]]></failure></testcase>
<testcase time="0" name="org.eslint.indent"><failure message="Expected indentation of 8 space characters but found 6."><![CDATA[line 5, col 7, Warning - Expected indentation of 8 space characters but found 6. (indent)]]></failure></testcase>
<testcase time="0" name="org.eslint.consistent-return"><failure message="Expected a return value."><![CDATA[line 5, col 7, Error - Expected a return value. (consistent-return)]]></failure></testcase>
<testcase time="0" name="org.eslint.semi"><failure message="Missing semicolon."><![CDATA[line 5, col 13, Warning - Missing semicolon. (semi)]]></failure></testcase>
<testcase time="0" name="org.eslint.no-extra-semi"><failure message="Unnecessary semicolon."><![CDATA[line 7, col 2, Error - Unnecessary semicolon. (no-extra-semi)]]></failure></testcase>
</testsuite>
</testsuites>

```

### stylish
```

C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js
  1:10  error    'addOne' is defined but never used                      no-unused-vars
  2:9   error    Use the isNaN function to compare with NaN              use-isnan
  3:16  error    Unexpected space before unary operator '++'             space-unary-ops
  3:20  warning  Missing semicolon                                       semi
  4:12  warning  Unexpected 'else' after 'return'                        no-else-return
  5:7   warning  Expected indentation of 8 space characters but found 6  indent
  5:7   error    Expected a return value                                 consistent-return
  5:13  warning  Missing semicolon                                       semi
  7:2   error    Unnecessary semicolon                                   no-extra-semi

✖ 9 problems (5 errors, 4 warnings)

```

### table
```

C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js

║ Line     │ Column   │ Type     │ Message                                                │ Rule ID              ║
╟──────────┼──────────┼──────────┼────────────────────────────────────────────────────────┼──────────────────────╢
║ 1        │ 10       │ error    │ 'addOne' is defined but never used                     │ no-unused-vars       ║
║ 2        │ 9        │ error    │ Use the isNaN function to compare with NaN.            │ use-isnan            ║
║ 3        │ 16       │ error    │ Unexpected space before unary operator '++'.           │ space-unary-ops      ║
║ 3        │ 20       │ warning  │ Missing semicolon.                                     │ semi                 ║
║ 4        │ 12       │ warning  │ Unexpected 'else' after 'return'.                      │ no-else-return       ║
║ 5        │ 7        │ warning  │ Expected indentation of 8 space characters but         │ indent               ║
║          │          │          │ found 6.                                               │                      ║
║ 5        │ 7        │ error    │ Expected a return value.                               │ consistent-return    ║
║ 5        │ 13       │ warning  │ Missing semicolon.                                     │ semi                 ║
║ 7        │ 2        │ error    │ Unnecessary semicolon.                                 │ no-extra-semi        ║

╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║ 5 Errors                                                                                                       ║
╟────────────────────────────────────────────────────────────────────────────────────────────────────────────────╢
║ 4 Warnings                                                                                                     ║
╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

```

### tap
```
TAP version 13
1..1
not ok 1 - C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js
  ---
  message: '''addOne'' is defined but never used'
  severity: error
  data:
    line: 1
    column: 10
    ruleId: no-unused-vars
  messages:
    - message: Use the isNaN function to compare with NaN.
      severity: error
      data:
        line: 2
        column: 9
        ruleId: use-isnan
    - message: Unexpected space before unary operator '++'.
      severity: error
      data:
        line: 3
        column: 16
        ruleId: space-unary-ops
    - message: Missing semicolon.
      severity: warning
      data:
        line: 3
        column: 20
        ruleId: semi
    - message: Unexpected 'else' after 'return'.
      severity: warning
      data:
        line: 4
        column: 12
        ruleId: no-else-return
    - message: Expected indentation of 8 space characters but found 6.
      severity: warning
      data:
        line: 5
        column: 7
        ruleId: indent
    - message: Expected a return value.
      severity: error
      data:
        line: 5
        column: 7
        ruleId: consistent-return
    - message: Missing semicolon.
      severity: warning
      data:
        line: 5
        column: 13
        ruleId: semi
    - message: Unnecessary semicolon.
      severity: error
      data:
        line: 7
        column: 2
        ruleId: no-extra-semi
  ...

```

### unix
```
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js:1:10: 'addOne' is defined but never used [Error/no-unused-vars]
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js:2:9: Use the isNaN function to compare with NaN. [Error/use-isnan]
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js:3:16: Unexpected space before unary operator '++'. [Error/space-unary-ops]
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js:3:20: Missing semicolon. [Warning/semi]
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js:4:12: Unexpected 'else' after 'return'. [Warning/no-else-return]
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js:5:7: Expected indentation of 8 space characters but found 6. [Warning/indent]
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js:5:7: Expected a return value. [Error/consistent-return]
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js:5:13: Missing semicolon. [Warning/semi]
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js:7:2: Unnecessary semicolon. [Error/no-extra-semi]

9 problems
```

### visualstudio
```
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js(1,10): error no-unused-vars : 'addOne' is defined but never used
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js(2,9): error use-isnan : Use the isNaN function to compare with NaN.
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js(3,16): error space-unary-ops : Unexpected space before unary operator '++'.
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js(3,20): warning semi : Missing semicolon.
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js(4,12): warning no-else-return : Unexpected 'else' after 'return'.
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js(5,7): warning indent : Expected indentation of 8 space characters but found 6.
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js(5,7): error consistent-return : Expected a return value.
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js(5,13): warning semi : Missing semicolon.
C:\Users\Nicholas\projects\personal\eslint\fullOfProblems.js(7,2): error no-extra-semi : Unnecessary semicolon.

9 problems
```

"use strict";

define(["react", "jsx!editor", "jsx!messages", "jsx!fixedCode", "jsx!configuration", "eslint", "unicode"], function(React, Editor, Messages, FixedCode, Configuration, Linter, Unicode) {
    var hasLocalStorage = (function() {
        try {
            window.localStorage.setItem("localStorageTest", "foo");
            window.localStorage.removeItem("localStorageTest");
            return true;
        } catch (_) {
            return false;
        }
    }());

    var linter = new Linter();
    var rules = linter.getRules();
    var ruleNames = Array.from(rules.keys());
    var docs = (function() {
        var map = rules;
        var result = {};

        map.forEach(function(value, key) {
            result[key] = value.meta;
        });
        return result;
    }());

    var ENV_NAMES = [
        "browser",
        "node",
        "commonjs",
        "shared-node-browser",
        "worker",
        "amd",
        "mocha",
        "jasmine",
        "jest",
        "phantomjs",
        "jquery",
        "qunit",
        "prototypejs",
        "shelljs",
        "meteor",
        "mongo",
        "protractor",
        "applescript",
        "nashorn",
        "serviceworker",
        "atomtest",
        "embertest",
        "webextensions",
        "es6",
        "greasemonkey"
    ];

    return React.createClass({
        displayName: "App",
        getInitialState: function() {
            var storedState = JSON.parse(window.localStorage.getItem("linterDemoState") || null);
            var urlState = (function() {
                try {
                    return JSON.parse(Unicode.decodeFromBase64(window.location.hash.replace(/^#/, "")));
                } catch (err) {
                    return null;
                }
            }());

            var initialState = Object.assign(
                { fix: false },
                urlState || storedState || {
                    options: {
                        parserOptions: {
                            ecmaVersion: 5,
                            sourceType: "script",
                            ecmaFeatures: {}
                        },
                        rules: (function() {
                            var result = {};

                            rules.forEach(function(rule, ruleId) {
                                if (rule.meta.docs.recommended) {
                                    result[ruleId] = 2;
                                }
                            });
                            return result;
                        }()),
                        env: {}
                    },
                    text: "var foo = bar;"
                }
            );

            this.initialText = initialState.text;
            return initialState;
        },

        handleChange: function(event) {
            this.setState({ text: event.value }, this.storeState);
        },
        updateOptions: function(options) {
            this.setState({ options: options }, this.storeState);
        },
        lint: function() {
            return linter.verifyAndFix(this.state.text, this.state.options, { fix: this.state.fix });
        },
        storeState: function() {
            var serializedState = JSON.stringify({ text: this.state.text, options: this.state.options });

            if (hasLocalStorage) {
                window.localStorage.setItem("linterDemoState", serializedState);
            }
            window.location.hash = Unicode.encodeToBase64(serializedState);
        },
        enableFixMode: function() {
            this.setState({ fix: true });
        },
        disableFixMode: function() {
            this.setState({ fix: false });
        },
        render: function App() {
            var results = this.lint();
            var sourceCode = linter.getSourceCode();

            return (
                <div className="container editorRow">
                    <div className="row">
                        <div className="col-md-7">
                            <Editor
                                onChange={this.handleChange}
                                text={this.initialText}
                                errors={results.messages}
                                getIndexFromLoc={sourceCode && sourceCode.getIndexFromLoc.bind(sourceCode)}
                            />
                        </div>
                        <div className="col-md-5">
                            <ul className="nav nav-tabs" role="tablist">
                                <li
                                    role="presentation"
                                    className={this.state.fix ? "" : "active"}
                                >
                                    <a
                                        href="#messages"
                                        aria-controls="messages"
                                        role="tab"
                                        data-toggle="tab"
                                        onClick={this.disableFixMode}
                                    >
                                        Messages
                                    </a>
                                </li>
                                <li
                                    role="presentation"
                                    className={this.state.fix ? "active" : ""}
                                >
                                    <a
                                        href="#fixedCode"
                                        aria-controls="fixedCode"
                                        role="tab"
                                        data-toggle="tab"
                                        onClick={this.enableFixMode}
                                    >
                                        Fixed Code
                                    </a>
                                </li>
                            </ul>

                            <div className="tab-content">
                                <div role="tabpanel" className="tab-pane active" >
                                    {
                                        this.state.fix
                                            ? <FixedCode values={results.output} />
                                            : <Messages values={results.messages} />
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <Configuration
                            ruleNames={ruleNames}
                            envNames={ENV_NAMES}
                            options={this.state.options}
                            docs={docs}
                            onUpdate={this.updateOptions}
                            eslintVersion={linter.version}
                        />
                    </div>
                </div>
            );
        }
    });
});

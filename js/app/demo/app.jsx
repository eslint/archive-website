'use strict';

define(['react', 'jsx!editor', 'jsx!messages', 'jsx!fixedCode', 'jsx!configuration', 'eslint'], function(React, Editor, Messages, FixedCode, Configuration, Linter) {
    function defaultsDeep(object, defaults) {
        Object.keys(defaults).forEach(function(defaultKey) {
            if (Object.prototype.hasOwnProperty.call(object, defaultKey)) {
                if (
                    object[defaultKey] &&
                    typeof object[defaultKey] === 'object' &&
                    defaults[defaultKey] &&
                    typeof defaults[defaultKey] === 'object'
                ) {
                    defaultsDeep(object[defaultKey], defaults[defaultKey]);
                }
            } else {
                object[defaultKey] = defaults[defaultKey];
            }
        });
        return object;
    }

    var hasLocalStorage = function() {
        try {
            window.localStorage.setItem('localStorageTest', 'foo');
            window.localStorage.removeItem('localStorageTest');
            return true;
        } catch (_) {
            return false;
        }
    }();

    var linter = new Linter();
    var rules = linter.getRules();
    var docs = (function() {
        var map = rules;
        var result = {};
        map.forEach(function(value, key) {
            result[key] = value.meta;
        });
        return result;
    })();
    return React.createClass({
        displayName: 'App',
        getInitialState: function() {
            var storedState = JSON.parse(window.localStorage.getItem('linterDemoState') || '{}');

            var initialState = defaultsDeep(storedState, {
                options: {
                    parserOptions: {
                        ecmaVersion: 5,
                        sourceType: 'script',
                        ecmaFeatures: {
                            jsx: false,
                            globalReturn: false,
                            impliedStrict: false,
                            experimentalObjectRestSpread: false
                        }
                    },
                    rules: (function() {
                        var result = {};
                        rules.forEach(function(value, key) {
                            result[key] = value.meta.docs.recommended ? "error" : "off"
                        });
                        return result;
                    }()),
                    env: {
                        browser: false,
                        node: false,
                        commonjs: false,
                        "shared-node-browser": false,
                        worker: false,
                        amd: false,
                        mocha: false,
                        jasmine: false,
                        jest: false,
                        phantomjs: false,
                        jquery: false,
                        qunit: false,
                        prototypejs: false,
                        shelljs: false,
                        meteor: false,
                        mongo: false,
                        protractor: false,
                        applescript: false,
                        nashorn: false,
                        serviceworker: false,
                        atomtest: false,
                        embertest: false,
                        webextensions: false,
                        es6: false,
                        greasemonkey: false
                    }
                },
                text: 'var foo = bar;',
                fix: false,
            });

            this.initialText = initialState.text;
            return initialState;
        },

        handleChange: function(event) {
            this.setState({ text: event.value });
        },
        updateOptions: function(options) {
            this.setState({ options: options });
        },
        lint: function() {
            return linter.verifyAndFix(this.state.text, this.state.options, { fix: this.state.fix });
        },
        componentDidUpdate: function() {
            if (hasLocalStorage) {
                window.localStorage.setItem('linterDemoState', JSON.stringify(this.state));
            }
        },
        enableFixMode: function() {
            this.setState({ fix: true });
        },
        disableFixMode: function() {
            this.setState({ fix: false });
        },
        render: function() {
            var results = this.lint();
            return (
                <div className="container editorRow">
                    <div className="row">
                        <div className="col-md-7">
                            <Editor onChange={this.handleChange} text={this.initialText} errors={results.messages} />
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
                                        this.state.fix ?
                                            <FixedCode values={results.output} /> :
                                            <Messages values={results.messages} />
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <Configuration options={this.state.options} docs={docs} onUpdate={this.updateOptions} />
                    </div>
                </div>
            );
        }
    });
});

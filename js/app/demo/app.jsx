'use strict';

define(['react', 'jsx!editor', 'jsx!messages', 'jsx!fixedCode', 'jsx!configuration', 'eslint'], function(React, Editor, Messages, FixedCode, Configuration, Linter) {
    var eslint = new Linter();
    return React.createClass({
        displayName: 'App',
        getInitialState: function() {
            var rules = eslint.getRules();
            function getDocs() {
                var map = rules;
                var result = {};
                map.forEach(function(value, key) {
                    result[key] = value.meta;
                });
                return result;
            }

            return {
                messages: [],
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
                docs: getDocs(),
                fix: false,
                fixedText: 'var foo = bar;'
            };
        },

        handleChange: function(event) {
            this.setState({ text: event.value }, function() {
                this.lint();
            });
        },
        updateOptions: function(options) {
            this.setState({options: options}, function() {
                this.lint();
            });
        },
        verify: function() {
            var results = eslint.verify(this.state.text, this.state.options);
            this.setState({
                messages: results,
                name: this.state.text
            });
        },
        verifyAndFix: function() {
            var results = eslint.verifyAndFix(this.state.text, this.state.options, { filename: "fixedcode.js" });
            this.setState({
                messages: results.messages,
                fixedText: results.output
            });
        },
        lint: function() {
            setTimeout(function() {
                if (this.state.fix) {
                    this.verifyAndFix()
                } else {
                    this.verify();
                }
            }.bind(this), 1);
        },
        componentDidMount: function() {
            $('a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
                this.setState({ fix: e.target.innerText === "Fixed Code" }, function() {
                    this.lint();
                });
            }.bind(this))
        },
        render: function() {
            return (
                <div className="container editorRow">
                    <div className="row">
                        <div className="col-md-7">
                            <Editor onChange={this.handleChange} text="var foo = bar;" errors={this.state.messages} />
                        </div>
                        <div className="col-md-5">
                            <ul className="nav nav-tabs" role="tablist">
                                <li role="presentation" className="active"><a href="#messages" aria-controls="messages" role="tab" data-toggle="tab">Messages</a></li>
                                <li role="presentation"><a href="#fixedCode" aria-controls="fixedCode" role="tab" data-toggle="tab">Fixed Code</a></li>
                            </ul>

                            <div className="tab-content">
                                <div role="tabpanel" className="tab-pane active" >
                                    {
                                        this.state.fix ?
                                            <FixedCode values={this.state.fixedText} /> :
                                            <Messages values={this.state.messages} />
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <Configuration options={this.state.options} docs={this.state.docs} onUpdate={this.updateOptions} />
                    </div>
                </div>
            );
        }
    });
});

'use strict';

define(['react', 'jsx!editor', 'jsx!messages', 'jsx!configuration', 'eslint', 'text!../eslint.json'], function(React, Editor, Messages, Configuration, eslint, config) {
    return React.createClass({
        displayName: 'App',
        getInitialState: function() {
            function getDocs() {
                var map = eslint.getRules();
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
                    rules: JSON.parse(config).rules,
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
                docs: getDocs()
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
        lint: function() {
            setTimeout(function() {
                var results = eslint.verify(this.state.text, this.state.options);
                this.setState({
                    messages: results,
                    name: this.state.text
                });                
            }.bind(this), 1);
        },
        render: function() {
            return (
                <div className="container editorRow">
                    <div className="row">
                        <div className="col-md-7">
                            <Editor onChange={this.handleChange} text="var foo = bar;" errors={this.state.messages} />
                        </div>
                        <div className="col-md-5">
                            <Messages values={this.state.messages} />
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
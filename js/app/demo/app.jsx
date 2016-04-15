import React from 'react'
import Messages from './Messages'
import Editor from './editor'
import Configuration from './configuration'
import config from '../eslint.json'

// injected via <script>
const eslint = window.eslint;

const App = React.createClass({
    getInitialState: function() {
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
                rules: config.rules,
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
            text: 'var foo = bar;'
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
        setTimeout(() => {
            var results = eslint.verify(this.state.text, this.state.options);
            this.setState({
                messages: results,
                name: this.state.text
            })
        }, 0)
    },
    render: function() {
        return (
            <div className="container editorRow">
                <div className="row">
                    <div className="col-md-7">
                        <Editor onChange={this.handleChange} text="var foo = bar;"/>
                    </div>
                    <div className="col-md-5">
                        <Messages values={this.state.messages} />
                    </div>
                </div>
                <div className="row">
                    <Configuration options={this.state.options} onUpdate={this.updateOptions} />
                </div>
            </div>
        );
    }
});

export default App
'use strict';

define(['react', 'jsx!editor', 'jsx!messages', 'jsx!configuration', 'eslint'], function(React, Editor, Messages, Configuration, eslint) {
    return React.createClass({
        displayName: 'App',
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
                    rules: {}
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
            var results = eslint.verify(this.state.text, this.state.options);
            this.setState({
                messages: results,
                name: this.state.text
            });
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
});
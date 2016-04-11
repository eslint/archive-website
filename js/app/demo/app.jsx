'use strict';

define(['react', 'jsx!editor', 'jsx!messages', 'jsx!configuration', 'eslint'], function(React, Editor, Messages, Configuration, eslint) {
    return React.createClass({
        displayName: 'App',
        getInitialState: function() {
            return {
                messages: [],
                options: {
                    parserOptions: {},
                    rules: {}
                }
            };
        },

        handleChange: function(event) {
            var results = eslint.verify(event.value, { rules: { "no-alert": 2 }});
            this.setState({
                messages: results,
                name: event.value
            });
        },

        render: function() {
            return (
                <div className="container editorRow">
                    <div className="row">
                        <div className="col-md-7">
                            <Editor onChange={this.handleChange} />
                        </div>
                        <div className="col-md-5">
                            <Messages values={this.state.messages} />
                        </div>
                    </div>
                    <div className="row">
                        <Configuration options={this.state.options}/>
                    </div>
                    <div>{JSON.stringify(this.state.options)}</div>
                </div>
            );
        }
    });
});
'use strict';

define(['react', 'jsx!parserOptions', 'jsx!environments', 'jsx!rulesConfig'], function(React, ParserOptions, Environments, RulesConfig) {
    return React.createClass({
        displayName: 'Configuration',
        getInitialState: function() {
            return this.props.options;
        },
        updateParserOptions: function(options) {
            this.setState({ parserOptions: options }, function() {
                this.props.onUpdate(this.state);
            });
        },
        updateRules: function(rules) {
            this.setState({ rules: rules }, function() {
                this.props.onUpdate(this.state);
            });
        },
        updateEnvironments: function(env) {
            this.setState({ env: env }, function() {
                this.props.onUpdate(this.state);
            });
        },
        render: function() {
            return (
                <div className="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
                    <div className="panel panel-default">
                        <div className="panel-heading" role="tab" id="headingOne">
                            <h4 className="panel-title">
                                <a data-toggle="collapse" data-parent="#accordion" href="#configuration" aria-expanded="true" aria-controls="configuration">
                                    Rules Configuration
                                </a>
                            </h4>
                        </div>
                        <div id="configuration" className="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne">
                            <div className="panel-body">
                                <ParserOptions options={this.props.options.parserOptions} onUpdate={this.updateParserOptions} />
                                <hr />
                                <Environments env={this.props.options.env} onUpdate={this.updateEnvironments} />
                                <hr />
                                <RulesConfig config={this.props.options.rules} docs={this.props.docs} onUpdate={this.updateRules} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    });
});
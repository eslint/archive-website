'use strict';

define(['react', 'jsx!parserOptions', 'jsx!rulesConfig'], function(React, ParserOptions, RulesConfig) {
    return React.createClass({
        displayName: 'Configuration',
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
                                <ParserOptions options={this.props.options.parserOptions} />
                                <RulesConfig config={this.props.options.rules} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    });
});
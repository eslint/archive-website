'use strict';

define(['react', 'jsx!message'], function(React, Message) {
    return React.createClass({
        displayName: 'Messages',
        render: function() {
            if (!this.props.values || this.props.values.length === 0) {
                return (
                    <div id="results">
                        <div className="alert alert-success">Lint-free!</div>
                    </div>
                )
            } else {
                return (
                    <div id="results">
                        {
                            this.props.values.map(function(message, index) {
                                var key = '' + message.line + ':' + message.column + ':' + message.ruleId;
                                return <Message key={key} value={message} />;
                            }, this)
                        }
                    </div>
                );
            }
        }
    });
});

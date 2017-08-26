"use strict";

define(["react", "events"], function(React, events) {
    return React.createClass({
        displayName: "Message",
        handleClick: function() {
            events.trigger("showError", this.props.value.line, this.props.value.column);
        },
        render: function Message() {
            return (
                <div className={"alert alert-" + (this.props.value.fatal || this.props.value.severity === 2 ? "danger" : "warning")} title={this.props.value.message} onClick={this.handleClick}>
                    {this.props.value.line}:{this.props.value.column} - {this.props.value.message}
                    {
                        !this.props.value.fatal && [
                            " (",
                            <a key="ruleLink" href={"https://eslint.org/docs/rules/" + this.props.value.ruleId}>{this.props.value.ruleId}</a>,
                            ")"
                        ]
                    }
                </div>
            );
        }
    });
});

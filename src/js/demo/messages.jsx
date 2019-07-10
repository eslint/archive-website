import React from "react";
import Message from "./message";

export default React.createClass({
    displayName: "Messages",
    render: function Messages() {
        if (!this.props.values || this.props.values.length === 0) {
            return (
                <div id="results">
                    <div className="alert alert-success">Lint-free!</div>
                </div>
            );
        }
        return (
            <div id="results">
                {
                    this.props.values.map(function(message) {
                        var key = "" + message.line + ":" + message.column + ":" + message.ruleId;

                        return <Message key={key} value={message} />;
                    })
                }
            </div>
        );

    }
});

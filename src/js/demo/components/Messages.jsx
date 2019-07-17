import React from "react";
import Message from "./Message";

export default function Messages(props) {
    if (!props.values || props.values.length === 0) {
        return (
            <div id="results">
                <div className="alert alert-success">Lint-free!</div>
            </div>
        );
    }

    return (
        <div id="results">
            {
                props.values.map(message => {
                    const key = `${message.line}:${message.column}:${message.ruleId}`;

                    return <Message key={key} value={message} />;
                })
            }
        </div>
    );
}

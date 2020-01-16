import React from "react";
import events from "../utils/events";

function formatMessage({ line, column, message }) {

    // line and column are undefined when parsing cannot occur (e.g. misconfiguration)
    if (typeof line === "number" && typeof column === "number") {
        return `${line}:${column} - ${message}`;
    }

    return message;
}

export default function Message(props) {
    const isError = props.value.fatal || props.value.severity === 2;

    return (
        <button
            className={`alert btn-block report-message-alert alert-${isError ? "danger" : "warning"}`}
            title={props.value.message}
            onClick={
                () => events.trigger("showError", props.value.line, props.value.column)
            }
        >
            {formatMessage(props.value)}
            {
                !props.value.fatal && [
                    " (",
                    <a
                        key="ruleLink"
                        href={`https://eslint.org/docs/rules/${props.value.ruleId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {props.value.ruleId}
                    </a>,
                    ")"
                ]
            }
        </button>
    );
}

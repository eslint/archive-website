import React from "react";
import events from "./events";

export default function Message(props) {
    var isError = props.value.fatal || props.value.severity === 2;

    return (
        <button
            className={"alert btn-block report-message-alert alert-" + (isError ? "danger" : "warning")}
            title={props.value.message}
            onClick={
                function() {
                    events.trigger("showError", props.value.line, props.value.column);
                }
            }
        >
            {props.value.line}:{props.value.column} - {props.value.message}
            {
                !props.value.fatal && [
                    " (",
                    <a key="ruleLink" href={"https://eslint.org/docs/rules/" + props.value.ruleId}>{props.value.ruleId}</a>,
                    ")"
                ]
            }
        </button>
    );
}

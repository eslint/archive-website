import React from "react";
import BugReport from "./BugReport";

export default function Crash(props) {
    return (
        <div>
            <BugReport message="ESLint crashed!" />
            <pre id="crashError">
                {props.error.stack}
            </pre>
        </div>
    );
}

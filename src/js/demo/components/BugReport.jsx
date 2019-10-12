import React from "react";

export default function BugReport(props) {
    return (
        <div className="alert report-message-alert alert-danger">
            <div>
                {props.message}
            </div>
            <div>
                Please submit a bug report at:
            </div>
            <div>
                <a href="https://github.com/eslint/eslint/issues">https://github.com/eslint/eslint/issues</a>
            </div>
        </div>
    );
}

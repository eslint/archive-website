import React from "react";

var height = 304;

export default function FixedCode(props) {
    return (
        <pre
            id="fixedEditor"
            className="editor"
            data-editor-lang="js"
            style={{ height: height + "px" }}
        >
            {props.values}
        </pre>
    );
}

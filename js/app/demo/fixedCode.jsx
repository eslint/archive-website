"use strict";

define(["react"], function(React) {
    var height = 304;

    return function FixedCode(props) {
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
    };
});

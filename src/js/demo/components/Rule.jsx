import React from "react";

function Rule(props) {
    function handler(e) {
        props.onChange(e, props.rule);
    }

    return (
        <div className="checkbox">
            <label
                htmlFor={props.rule}
                data-toggle="popover"
                data-content={props.docs.description}
                title={props.rule}
            >
                <input type="checkbox" checked={props.isChecked} id={props.rule} onChange={handler} />
                {props.rule} {props.isDeprecated ? "(deprecated)" : ""}
            </label>
        </div>
    );
}

export default React.memo(Rule);

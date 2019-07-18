import React from "react";

export default function SelectAllCheckbox(props) {
    return (
        <input
            type="checkbox"
            checked={props.selectedCount === props.totalCount}
            ref={
                function(element) {
                    if (element) {
                        element.indeterminate = props.selectedCount > 0 && props.selectedCount < props.totalCount;
                    }
                }
            }
            onChange={
                function(event) {
                    if (event.target.checked) {
                        props.onSelectAll();
                    } else {
                        props.onDeselectAll();
                    }
                }
            }
            id={props.id}
        />
    );
}

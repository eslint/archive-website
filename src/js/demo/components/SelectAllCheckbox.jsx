import React from "react";

export default function SelectAllCheckbox(props) {
    return (
        <input
            type="checkbox"
            checked={props.selectedCount === props.totalCount}
            ref={
                element => {
                    if (element) {
                        element.indeterminate = props.selectedCount > 0 && props.selectedCount < props.totalCount;
                    }
                }
            }
            onChange={
                event => (event.target.checked ? props.onSelectAll() : props.onDeselectAll())
            }
            id={props.id}
        />
    );
}

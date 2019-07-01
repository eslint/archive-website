import React from "react";
import SelectAllCheckbox from "./selectAllCheckbox";

export default function Environments(props) {
    var columnLimit = 3;
    var rowLimit = Math.ceil(props.envNames.length / columnLimit);

    return (
        <div className="row">
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <h3>Environments</h3>
                    </div>
                </div>
                <div className="checkbox">
                    <label htmlFor="select-all-environments">
                        <SelectAllCheckbox
                            id="select-all-environments"
                            selectedCount={
                                props.envNames.filter(function(envName) {
                                    return props.env[envName];
                                }).length
                            }
                            totalCount={Object.keys(props.envNames).length}
                            onSelectAll={
                                function() {
                                    props.onUpdate(props.envNames.reduce(function(updatedEnv, envName) {
                                        updatedEnv[envName] = true;
                                        return updatedEnv;
                                    }, {}));
                                }
                            }
                            onDeselectAll={
                                function() {
                                    props.onUpdate({});
                                }
                            }
                        />
                        {" "}Enable globals from all environments
                    </label>
                </div>
                {
                    Array(columnLimit).fill().map(function(_, columnIndex) {
                        return (
                            <div className="col-md-4" key={columnIndex}>
                                {
                                    props.envNames.slice(columnIndex * rowLimit, (columnIndex + 1) * rowLimit)
                                        .map(function(envName) {
                                            return (
                                                <div className="checkbox" key={envName}>
                                                    <label htmlFor={envName}>
                                                        <input
                                                            type="checkbox"
                                                            checked={props.env[envName]}
                                                            id={envName}
                                                            onChange={
                                                                function(event) {
                                                                    var updatedEnv = {};

                                                                    updatedEnv[envName] = event.target.checked;
                                                                    props.onUpdate(
                                                                        Object.assign({}, props.env, updatedEnv)
                                                                    );
                                                                }
                                                            }
                                                        />
                                                        {envName}
                                                    </label>
                                                </div>
                                            );
                                        })
                                }
                            </div>
                        );

                    })
                }
            </div>
        </div>
    );
}

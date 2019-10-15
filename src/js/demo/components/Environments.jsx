import React from "react";
import SelectAllCheckbox from "./SelectAllCheckbox";

function Environments(props) {
    const columnLimit = 3;
    const rowLimit = Math.ceil(props.envNames.length / columnLimit);

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
                                props.envNames.filter(envName => props.env[envName]).length
                            }
                            totalCount={Object.keys(props.envNames).length}
                            onSelectAll={
                                () => props.onUpdate(props.envNames.reduce((updatedEnv, envName) => {
                                    updatedEnv[envName] = true;
                                    return updatedEnv;
                                }, {}))
                            }
                            onDeselectAll={() => props.onUpdate({})}
                        />
                        {" "}Enable globals from all environments
                    </label>
                </div>
                {
                    Array(columnLimit).fill().map((_, columnIndex) => (
                        <div className="col-md-4" key={columnIndex}>
                            {
                                props.envNames.slice(columnIndex * rowLimit, (columnIndex + 1) * rowLimit)
                                    .map(envName => (
                                        <div className="checkbox" key={envName}>
                                            <label htmlFor={envName}>
                                                <input
                                                    type="checkbox"
                                                    checked={!!props.env[envName]}
                                                    id={envName}
                                                    onChange={
                                                        event => {
                                                            const updatedEnv = {};

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
                                    ))
                            }
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

export default React.memo(Environments);

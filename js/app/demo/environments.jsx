'use strict';

define(['react'], function(React) {
    return function Environments(props) {
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
                    {
                        Array(columnLimit).fill().map(function(_, columnIndex) {
                            return (
                                <div className="col-md-4" key={columnIndex}>
                                    {
                                        props.envNames.slice(columnIndex * rowLimit, (columnIndex + 1) * rowLimit)
                                            .map(function(envName) {
                                                return (
                                                    <div className="checkbox" key={envName}>
                                                        <label>
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
    };
});

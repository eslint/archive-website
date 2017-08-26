"use strict";

define(["react"], function(React) {
    return function ParserOptions(props) {
        return (
            <div className="row">
                <div className="col-md-4">
                    <h3>ECMA Version</h3>
                    <select
                        value={props.options.ecmaVersion}
                        onChange={
                            function(event) {
                                props.onUpdate(Object.assign({}, props.options, { ecmaVersion: +event.target.value }));
                            }
                        }
                    >
                        <option value="3">3</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                    </select>
                </div>
                <div className="col-md-4">
                    <h3>Source Type</h3>
                    <select
                        value={props.options.sourceType}
                        onChange={
                            function(event) {
                                props.onUpdate(Object.assign({}, props.options, { sourceType: event.target.value }));
                            }
                        }
                    >
                        <option value="module">module</option>
                        <option value="script">script</option>
                    </select>
                </div>
                <div className="col-md-4">
                    <h3>ECMA Features</h3>
                    <div className="ecmaFeatures list">
                        {
                            ["jsx", "globalReturn", "impliedStrict", "experimentalObjectRestSpread"].map(function(ecmaFeature) {
                                return (
                                    <div className="checkbox" key={ecmaFeature}>
                                        <label htmlFor={ecmaFeature}>
                                            <input
                                                type="checkbox"
                                                checked={props.options.ecmaFeatures[ecmaFeature]}
                                                className="option-checkbox"
                                                id={ecmaFeature}
                                                onChange={
                                                    function(event) {
                                                        var updatedFeatures = Object.assign({}, props.options.ecmaFeatures);

                                                        if (event.target.checked) {
                                                            updatedFeatures[ecmaFeature] = true;
                                                        } else {
                                                            delete updatedFeatures[ecmaFeature];
                                                        }
                                                        props.onUpdate(Object.assign({}, props.options, { ecmaFeatures: updatedFeatures }));
                                                    }
                                                }
                                            />
                                            {ecmaFeature}
                                        </label>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </div>
        );
    };
});

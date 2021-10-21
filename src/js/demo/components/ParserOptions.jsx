import React from "react";

function ParserOptions(props) {
    return (
        <div className="row">
            <div className="col-md-4">
                <h3>ECMA Version</h3>
                <select
                    value={props.options.ecmaVersion}
                    onChange={
                        event => {
                            const ecmaVersion = event.target.value === "latest" ? "latest" : +event.target.value;

                            props.onUpdate(Object.assign({}, props.options, { ecmaVersion }));
                        }
                    }
                >
                    <option value="3">3</option>
                    <option value="5">5</option>
                    <option value="6">2015</option>
                    <option value="7">2016</option>
                    <option value="8">2017</option>
                    <option value="9">2018</option>
                    <option value="10">2019</option>
                    <option value="11">2020</option>
                    <option value="12">2021</option>
                    <option value="13">2022</option>
                    <option value="latest">latest</option>
                </select>
            </div>
            <div className="col-md-4">
                <h3>Source Type</h3>
                <select
                    value={props.options.sourceType}
                    onChange={
                        event => props.onUpdate(Object.assign({}, props.options, { sourceType: event.target.value }))
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
                        ["jsx", "globalReturn", "impliedStrict"].map(ecmaFeature => (
                            <div className="checkbox" key={ecmaFeature}>
                                <label htmlFor={ecmaFeature}>
                                    <input
                                        type="checkbox"
                                        checked={!!props.options.ecmaFeatures[ecmaFeature]}
                                        className="option-checkbox"
                                        id={ecmaFeature}
                                        onChange={
                                            event => {
                                                const updatedFeatures = Object.assign({}, props.options.ecmaFeatures);

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
                        ))
                    }
                </div>
            </div>
        </div>
    );
}

export default React.memo(ParserOptions);

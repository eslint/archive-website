import React from "react";
import SelectAllCheckbox from "./selectAllCheckbox";

function Rule(ref) {

    function handler(e) {
        ref.handleChange(e, ref.rule);
    }
    function showPopover(e) {
        e.currentTarget.Popover.show();
    }
    function hidePopover(e) {
        e.currentTarget.Popover.hide();
    }

    return (
        <div className="checkbox">
            <label
                htmlFor={ref.rule}
                onMouseEnter={showPopover}
                onMouseLeave={hidePopover}
                data-toggle="popover"
                data-content={ref.docs.description}
                title={ref.rule}
            >
                <input type="checkbox" checked={ref.isChecked} id={ref.rule} onChange={handler} />
                {ref.rule}
            </label>
        </div>
    );
}

export default function RulesConfig(props) {
    function shouldBeChecked(rule) {
        return props.config[rule] && props.config[rule] !== "off" && props.config[rule] !== 0;
    }
    function handleChange(e, key) {
        var updatedConfig = Object.assign({}, props.config);

        if (e.target.checked) {
            updatedConfig[key] = 2;
        } else {
            delete updatedConfig[key];
        }
        props.onUpdate(updatedConfig);
    }
    function getRow(i) {
        var limit = Math.ceil(props.ruleNames.length / 3);
        var start = limit * i;

        return Array(limit).fill("").map(function(item, index) {
            var rule = props.ruleNames[start + index];

            return rule && <Rule key={rule} rule={rule} docs={props.docs[rule].docs} isChecked={shouldBeChecked(rule)} handleChange={handleChange} />;
        });
    }
    function renderRules() {
        return [0, 1, 2].map(function(i) {
            return (
                <div className="col-md-4" key={i}>
                    {getRow(i)}
                </div>
            );
        });
    }

    return (
        <div className="row rules">
            <div className="container">
                <div className="row"><div className="col-md-12"><h3>Rules</h3></div></div>
                <div className="checkbox">
                    <label htmlFor="select-all-rules">
                        <SelectAllCheckbox
                            id="select-all-rules"
                            selectedCount={
                                props.ruleNames.filter(function(ruleName) {
                                    return props.config[ruleName] && props.config[ruleName] !== "off";
                                }).length
                            }
                            totalCount={props.ruleNames.length}
                            onSelectAll={
                                function() {
                                    props.onUpdate(props.ruleNames.reduce(function(updatedConfig, ruleName) {
                                        updatedConfig[ruleName] = 2;
                                        return updatedConfig;
                                    }, {}));
                                }
                            }
                            onDeselectAll={
                                function() {
                                    props.onUpdate({});
                                }
                            }
                        />
                        {" "}Enable all rules
                    </label>
                </div>
                <div className="row">{renderRules()}</div>
            </div>
        </div>
    );
}

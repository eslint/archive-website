import React, { PureComponent } from "react";
import SelectAllCheckbox from "./SelectAllCheckbox";
import Rule from "./Rule";

export default class RulesConfig extends PureComponent {
    constructor(props) {
        super(props);
        this.handleSingleChange = this.handleSingleChange.bind(this);
        this.handleSelectAll = this.handleSelectAll.bind(this);
        this.handleDeselectAll = this.handleDeselectAll.bind(this);
    }

    shouldBeChecked(rule) {
        return Boolean(this.props.config[rule]) && this.props.config[rule] !== "off" && this.props.config[rule] !== 0;
    }

    handleSingleChange(e, key) {
        const updatedConfig = Object.assign({}, this.props.config);

        if (e.target.checked) {
            updatedConfig[key] = 2;
        } else {
            delete updatedConfig[key];
        }
        this.props.onUpdate(updatedConfig);
    }

    handleSelectAll() {
        this.props.onUpdate(this.props.ruleNames.reduce((updatedConfig, ruleName) => {
            updatedConfig[ruleName] = 2;
            return updatedConfig;
        }, {}));
    }

    handleDeselectAll() {
        this.props.onUpdate({});
    }

    getRow(i) {
        const limit = Math.ceil(this.props.ruleNames.length / 3);
        const start = limit * i;

        return Array(limit).fill("").map((item, index) => {
            const rule = this.props.ruleNames[start + index];

            return rule &&
                <Rule
                    key={rule}
                    rule={rule}
                    docs={this.props.docs[rule].docs}
                    isDeprecated={this.props.docs[rule].deprecated}
                    isChecked={this.shouldBeChecked(rule)}
                    onChange={this.handleSingleChange}
                />;
        });
    }

    renderRules() {
        return [0, 1, 2].map(i => (
            <div className="col-md-4" key={i}>
                {this.getRow(i)}
            </div>
        ));
    }

    render() {
        return (
            <div className="row rules">
                <div className="container">
                    <div className="row"><div className="col-md-12"><h3>Rules</h3></div></div>
                    <div className="checkbox">
                        <label htmlFor="select-all-rules">
                            <SelectAllCheckbox
                                id="select-all-rules"
                                selectedCount={
                                    this.props.ruleNames.filter(ruleName => this.props.config[ruleName] && this.props.config[ruleName] !== "off").length
                                }
                                totalCount={this.props.ruleNames.length}
                                onSelectAll={this.handleSelectAll}
                                onDeselectAll={this.handleDeselectAll}
                            />
                            {" "}Enable all rules
                        </label>
                    </div>
                    <div className="row">{this.renderRules()}</div>
                </div>
            </div>
        );
    }
}

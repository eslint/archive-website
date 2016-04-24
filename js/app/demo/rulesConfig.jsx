import React from 'react';

const Rule = ({ rule, isChecked, handleChange }) => (
    <div className="checkbox" key={rule}>
        <label>
            <input type="checkbox"
                checked={isChecked}
                id={rule}
                onChange={handleChange} />
            {rule}
        </label>
    </div>
)

const RulesConfig = React.createClass({
    getInitialState() {
        return this.props.config;
    },
    shouldBeChecked(ruleValue) {
        return typeof ruleValue === 'string' ? ruleValue !== 'off' : ruleValue[0] !== 'off';
    },
    getRow(i) {
        const rules = Object.keys(this.state);
        const limit = Math.ceil(rules.length / 3);
        const start = limit * i;
        // console.log(rules.length, i, limit, start);
        return Array(limit).fill('').map((_, j) => {
            const rule = rules[start + j];
            if (!rule) {
                return;
            }
            let isChecked = this.shouldBeChecked(this.state[rule]);
            return <Rule rule={rule} isChecked={isChecked} handleChange={handleChange} />
        });
    },
    renderRules() {
        return Array(3).fill('').map((_, i) => (
            <div className="col-md-4" key={i}>
                {this.getRow(i)}
            </div>
        ))
    },
    handleChange(e) {
        let key = e.target.id;
        let change = {};
        if (typeof this.state[key] === 'string') {
            change[key] = e.target.checked ? 'error' : 'off';
        } else {
            change[key] = this.state[key];
            change[key][0] = e.target.checked ? 'error' : 'off';
        }
        this.setState(change);
//      this.props.onUpdate(this.state)
    },
    render: function() {
        return (
            <div className="row rules">
                <div className="container">
                    <div className="row"><div className="col-md-12"><h3>Rules</h3></div></div>
                    <div className="row">{this.renderRules()}</div>
                </div>
            </div>
        );
    }
});

export default RulesConfig;
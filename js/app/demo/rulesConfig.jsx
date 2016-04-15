import React from 'react';

const RulesConfig = React.createClass({
    getInitialState: function() {
        return this.props.config;
    },
    buildRules: function(state) {
        var result = [];
        var rules = Object.keys(state);
        var limit = Math.ceil(rules.length / 3);
        for (var i = 0; i < 3; i++) {
            var currentRow = [];
            for (var j = i * limit, l = (i + 1) * limit; j < l && j < rules.length; j++) {
                currentRow.push(
                    <div className="checkbox" key={rules[j]}>
                        <label>
                            <input type="checkbox" checked={typeof state[rules[j]] === 'string' ? state[rules[j]] !== 'off' : state[rules[j]][0] !== 'off'} id={rules[j]} onChange={this.handleChange.bind(this, rules[j])} />{rules[j]}
                        </label>
                    </div>
                );
            }
            result.push(
                <div className="col-md-4" key={i}>
                    {currentRow}
                </div>
            );
        }
        return result;
    },
    handleChange: function(key, e) {
        var change = {};
        if (typeof this.state[key] === 'string') {
            change[key] = e.target.checked ? 'error' : 'off';
        } else {
            change[key] = this.state[key];
            change[key][0] = e.target.checked ? 'error' : 'off';
        }
        this.setState(change, function() {
            this.props.onUpdate(this.state)
        });
    },
    render: function() {
        return (
            <div className="row rules">
                <div className="container">
                    <div className="row"><div className="col-md-12"><h3>Rules</h3></div></div>
                    <div className="row">{this.buildRules(this.state)}</div>
                </div>
            </div>
        );
    }
});

export default RulesConfig;
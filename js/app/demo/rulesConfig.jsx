'use strict';

define(['react'], function(React) {

    function Rule(ref) {
        var handler = function(e) {
            ref.handleChange(e, ref.rule);
        };
        var showPopover = function(e) {
            $(e.currentTarget).popover('show');
        };
        var hidePopover = function(e) {
            $(e.currentTarget).popover('hide');
        };
        return (
            <div className="checkbox">
                <label onMouseEnter={showPopover} onMouseLeave={hidePopover} data-toggle="popover" data-content={ref.docs.description} title={ref.rule}>
                    <input type="checkbox" checked={ref.isChecked} id={ref.rule} onChange={handler} />
                    {ref.rule}
                </label>
            </div>
        );
    }

    return React.createClass({
        displayName: 'RulesConfig',
        getInitialState: function() {
            return this.props.config;
        },
        shouldBeChecked(rule) {
            var ruleValue = this.state[rule];
            return typeof ruleValue === 'string' ? ruleValue !== 'off' : ruleValue[0] !== 'off';
        },
        getRow(i) {
            var rules = Object.keys(this.state);
            var limit = Math.ceil(rules.length / 3);
            const start = limit * i;
            return Array(limit).fill('').map(function(item, index) {
                var rule = rules[start + index];
                return rule && <Rule key={rule} rule={rule} docs={this.props.docs[rule].docs} isChecked={this.shouldBeChecked(rule)} handleChange={this.handleChange} />
            }, this);
        },
        renderRules() {
            return [0, 1, 2].map(function(i) {
                return (
                    <div className="col-md-4" key={i}>
                        {this.getRow(i)}
                    </div>
                );
            }, this);
        },
        handleChange: function(e, key) {
            var change = {};
            var value = e.target.checked ? 'error' : 'off';
            if (typeof this.state[key] === 'string') {
                change[key] = value;
            } else {
                change[key] = this.state[key];
                change[key][0] = value;
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
                        <div className="row">{this.renderRules()}</div>
                    </div>
                </div>
            );
        }
    });
});
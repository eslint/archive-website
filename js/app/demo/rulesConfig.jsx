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

    return function RulesConfig(props) {
        function shouldBeChecked(rule) {
            var ruleValue = props.config[rule];
            return typeof ruleValue === 'string' ? ruleValue !== 'off' : ruleValue[0] !== 'off';
        }
        function getRow(i) {
            var rules = Object.keys(props.config);
            var limit = Math.ceil(rules.length / 3);
            const start = limit * i;
            return Array(limit).fill('').map(function(item, index) {
                var rule = rules[start + index];
                return rule && <Rule key={rule} rule={rule} docs={props.docs[rule].docs} isChecked={shouldBeChecked(rule)} handleChange={handleChange} />
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
        function handleChange(e, key) {
            var change = {};
            var value = e.target.checked ? 'error' : 'off';
            if (typeof props.config[key] === 'string') {
                change[key] = value;
            } else {
                change[key] = props.config[key];
                change[key][0] = value;
            }
            props.onUpdate(Object.assign({}, props.config, change));
        }

        return (
            <div className="row rules">
                <div className="container">
                    <div className="row"><div className="col-md-12"><h3>Rules</h3></div></div>
                    <div className="row">{renderRules()}</div>
                </div>
            </div>
        );
    };
});

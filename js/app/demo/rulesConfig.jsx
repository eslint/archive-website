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
            return props.config[rule] && props.config[rule] !== "off" && props.config[rule] !== 0;
        }
        function getRow(i) {
            var limit = Math.ceil(props.ruleNames.length / 3);
            const start = limit * i;
            return Array(limit).fill('').map(function(item, index) {
                var rule = props.ruleNames[start + index];
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
            var updatedConfig = Object.assign({}, props.config);
            if (e.target.checked) {
                updatedConfig[key] = "error";
            } else {
                delete updatedConfig[key];
            }
            props.onUpdate(updatedConfig);
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

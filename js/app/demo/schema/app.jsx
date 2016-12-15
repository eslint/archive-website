'use strict';

define(['react', 'jsx!form', 'text!../../schemas.json'], function(React, Form, schemas) {
    return React.createClass({
        displayName: 'App',
        getInitialState: function() {
            this.schemas = JSON.parse(schemas);
            var state = {};
            Object.keys(this.schemas).forEach(function(key) {
                state[key] = 'off';
            });
            return state;
        },
        renderRules: function() {
            var result = [];
            var rules = Object.keys(this.state);
            var limit = Math.ceil(rules.length / 3);
            for (var i = 0; i < 3; i++) {
                var currentRow = [];
                for (var j = i * limit, l = (i + 1) * limit; j < l && j < rules.length; j++) {
                    currentRow.push(
                        <div className="checkbox" key={rules[j]}>
                            <label>
                                <input type="checkbox" checked={typeof this.state[rules[j]] === 'string' ? this.state[rules[j]] !== 'off' : this.state[rules[j]][0] !== 'off'} id={rules[j]} />{rules[j]}
                            </label>
                            <Form schema={this.schemas[rules[j]]} />
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
        render: function() {
            return (
                <div class="container">{this.renderRules()}</div>
            );
        }
    });
});

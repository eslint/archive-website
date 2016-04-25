import React from 'react';

const Environments = React.createClass({
    handleChange: function(env, event) {
        // Shouldn't this be what we want??
        // event.preventDefault();
        var environment = {};
        environment[env] = event.target.checked;
        this.props.onUpdate(env, event.target.checked);
    },
    renderEnvironments: function() {
        var env = Object.keys(this.props.env);
        var limit = Math.ceil(env.length / 3);
        var result = [];
        for (var i = 0; i < 3; i++) {
            var currentRow = [];
            for (var j = i * limit, l = (i + 1) * limit; j < l && j < env.length; j++) {
                currentRow.push(
                    <div className="checkbox" key={env[j]}>
                        <label>
                            <input type="checkbox" checked={this.props[env[j]]} id={env[j]} onChange={this.handleChange.bind(this, env[j])} />{env[j]}
                        </label>
                    </div>
                );
            }
            result.push(
                <div className="col-md-4" key={i}>
                    {currentRow}
                </div>);
        }
        return result;
    },
    render: function() {
        return (
            <div className="row">
                <div className="container">
                    <div className="row"><div className="col-md-12"><h3>Environments</h3></div></div>
                    {this.renderEnvironments()}
                </div>
            </div>
        );
    }
});

export default Environments;
'use strict';

define(['react', 'jsx!string', 'jsx!boolean'], function(React, String, Boolean) {
    return React.createClass({
        displayName: 'Type',
        render: function() {
            switch(this.props.value.type) {
                case 'string':
                    return <String value={this.props.value} />;
                case 'boolean':
                    return <Boolean value={this.props.value} />;
                case 'object':
                    <span>
                        {
                            Object.keys(this.props.value.properties).map(function(propName) {
                                return <span>{propName}<Type value={this.props.value.properties[propName]} /></span>;
                            }, this)
                        }
                    </span>
                default:
                    return <span>{this.props.value.type}</span>;
            }
        }
    });
});

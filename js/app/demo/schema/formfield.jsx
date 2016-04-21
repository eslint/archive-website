'use strict';

define(['react', 'jsx!oneof', 'jsx!enum', 'jsx!type'], function(React, OneOf, Enum, Type) {
    return React.createClass({
        displayName: 'FormField',
        renderField: function() {
            if (this.props.field.enum) {
                return <Enum value={this.props.field.enum} />;
            }
            if (this.props.field.oneOf) {
                return <OneOf value={this.props.field} />;
            }
            if (this.props.field.type) {
                return <Type value={this.props.field} />;
            }
            return <span>Unknown</span>;
        },
        render: function() {
            if (Array.isArray(this.props.field)) {
                return <span>Array</span>;
            } else {
                return this.renderField();
            }
        }
    });
});

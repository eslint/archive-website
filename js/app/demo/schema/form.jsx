'use strict';

define(['react', 'jsx!formfield'], function(React, FormField) {
    return React.createClass({
        displayName: 'Form',
        render: function() {
            if (Array.isArray(this.props.schema) && this.props.schema.length === 0) {
                return <div></div>;
            } else {
                if (Array.isArray(this.props.schema)) {
                    return (
                        <div className="form">
                            { 
                                this.props.schema.map(function(item, index) {
                                    return <FormField field={item} key={'field' + index} />
                                })
                            }
                        </div>
                    );
                } else {
                    return <div className="form">Object</div>;
                }
            }
        }
    });
});

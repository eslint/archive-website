'use strict';

define(['react'], function(React) {
    return React.createClass({
        displayName: 'Enum',
        render: function() {
            return (
                <select>
                    {
                        this.props.value.map(function(item, index) {
                            return <option key={item + index} value={item}>{item}</option>;
                        })
                    }
                </select>
            )
        }
    });
});

'use strict';

var height = 350;

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this,
            args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

define(['react', 'orion', 'reactDom'], function(React, orion, ReactDOM) {
    return React.createClass({
        displayName: 'Editor',
        componentDidMount: function() {
            var element = ReactDOM.findDOMNode(this);
            var editor = orion(element);
            
            var update = debounce(function() {
                this.props.onChange({ value: editor.getModel().getText() });
            }.bind(this), 500);
            
            editor.getTextView().onModify = function() {
                update();
            }.bind(this);
            
            this.props.onChange({ value: editor.getModel().getText() });
        },
        render: function() {
            return (
                <pre id="editor" data-editor-lang="js" style={{height: height + 'px'}}>var foo = bar;</pre>
            );
        }
    });
});
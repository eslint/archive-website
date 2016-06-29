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
        editor: null,
        componentDidMount: function() {
            var element = ReactDOM.findDOMNode(this);
            this.editor = orion(element);
            
            var update = debounce(function() {
                this.props.onChange({ value: this.editor.getModel().getText() });
            }.bind(this), 500);
            
            this.editor.getTextView().onModify = function() {
                update();
            }.bind(this);
            
            this.props.onChange({ value: this.editor.getModel().getText() });
        },
        componentWillReceiveProps: function(nextProps) {
            if (nextProps.focusedError) {
                this.editor.onGotoLine(nextProps.focusedError.line - 1, nextProps.focusedError.column - 1, nextProps.focusedError.column - 1);
            }
        },
        render: function() {
            return (
                <pre id="editor" data-editor-lang="js" style={{height: height + 'px'}}>{this.props.text}</pre>
            );
        }
    });
});
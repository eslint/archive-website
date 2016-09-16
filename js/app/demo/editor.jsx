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

define(['react', 'orion', 'reactDom', 'events'], function(React, orion, ReactDOM, events) {
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

            events.on('showError', function(line, column) {
                this.editor.onGotoLine(line - 1, column - 1, column - 1);
            }.bind(this));
        },

        componentWillReceiveProps: function(nextProps) {
            if (nextProps.errors) {
                this.editor.showProblems(nextProps.errors.map(function(error) {
                    return {
                        line: error.line,
                        start: error.column,
                        end: error.column + 1,
                        description: error.message + ' (' + error.ruleId + ')',
                        severity: error.severity === 2 ? 'error' : 'warning'
                    };
                }));
            }
        },

        render: function() {
            return (
                <pre id="editor" data-editor-lang="js" style={{height: height + 'px'}}>{this.props.text}</pre>
            );
        }
    });
});
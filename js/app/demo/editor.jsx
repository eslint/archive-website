"use strict";

var height = 350;

function debounce(func, wait, immediate) {
    var timeout;

    return function() {
        var context = this, // eslint-disable-line no-invalid-this
            args = arguments;

        function later() {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        }
        var callNow = immediate && !timeout;

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
}

define(["react", "orion", "reactDom", "events"], function(React, orion, ReactDOM, events) {
    return React.createClass({
        displayName: "Editor",
        editor: null,
        componentDidMount: function() {
            this.editor = orion(this.element);
            this.editor.getTextView().onModify = debounce(function() {
                this.props.onChange({ value: this.editor.getModel().getText() });
            }.bind(this), 500);

            events.on("showError", function(line, column) {
                this.editor.onGotoLine(line - 1, column - 1, column - 1);
            }.bind(this));

            this.showProblems();
        },

        showProblems: function() {
            if (this.props.errors) {
                this.editor.showProblems(this.props.errors.map(function(error) {
                    return {
                        line: error.line,
                        start: error.column,
                        end: error.column + 1,
                        description: error.message + " (" + error.ruleId + ")",
                        severity: error.severity === 2 ? "error" : "warning"
                    };
                }));
            }
        },

        componentDidUpdate: function() {
            this.showProblems();
        },

        render: function Editor() {
            return (
                <pre
                    id="editor"
                    data-editor-lang="js"
                    style={{ height: height + "px" }}
                    ref={
                        function(element) {
                            this.element = element;
                        }.bind(this)
                    }
                >
                    {this.props.text}
                </pre>
            );
        }
    });
});

import React from 'react'
import ReactDOM from 'reactDom'
import { debounce } from './utils'

// import orion from 'orion'
const orion = window.orion.editor.edit.bind(window.orion.editor)

// constants
const height = 350;

const Editor = React.createClass({
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
            <pre id="editor" data-editor-lang="js" style={{height: height + 'px'}}>{this.props.text}</pre>
        );
    }
});

export default Editor
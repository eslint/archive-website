'use strict';

define(['react'], function(React) {
    var height = 304;
    return React.createClass({
        displayName: 'FixedCode',
        render: function() {
            return (
                <pre id="fixedEditor" class="editor" data-editor-lang="js" style={{height: height + 'px'}}>{this.props.values}</pre>
            );
        }
    });
});

"use strict";

define(["react", "reactDom", "jsx!app"], function(React, ReactDOM, App) {
    ReactDOM.render(
        React.createElement(App),
        document.getElementById("app")
    );
});

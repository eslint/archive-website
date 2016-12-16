requirejs.config({
    paths: {
        'react': 'https://cdnjs.cloudflare.com/ajax/libs/react/15.0.1/react.min',
        'reactDom': 'https://cdnjs.cloudflare.com/ajax/libs/react/15.0.1/react-dom.min',
        'text': '../../vendor/text',
        'JSXTransformer': '../../vendor/JSXTransformer',
        'jsx': '../../vendor/jsx',
        'orion': 'http://eclipse.org/orion/editor/releases/current/built-editor-amd.min',
        'eslint': '../eslint'
    },
    jsx: {
        fileExtension: '.jsx'
    },
    waitSeconds: 15
});

requirejs(['main']);
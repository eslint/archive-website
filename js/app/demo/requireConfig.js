requirejs.config({
    paths: {
        'react': '../../vendor/react',
        'reactDom': '../../vendor/react_dom',
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
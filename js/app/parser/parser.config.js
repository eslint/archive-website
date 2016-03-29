module.exports = {
	range: false,
	loc: false,
	comments: false,
	attachComment: false,
	tokens: false,
	tolerant: true,
	ecmaVersion: {
		3: false,
		5: false,
		6: true
	},
	sourceType: {
		script: false,
		module: true
	},
	ecmaFeatures: {
		jsx: true,
		globalReturn: true,
		impliedStrict: false,
		experimentalObjectRestSpread: true
	}
};

module.exports = {
	collectCoverage: true,
	coverageReporters: ['lcov', 'text-summary'],
	coverageThreshold: {
		global: {
			statements: 100,
			branches: 100,
			functions: 100,
			lines: 100,
		},
	},
	collectCoverageFrom: [
		"<rootDir>/src/**/*.ts",
		"!<rootDir>/src/stacks/*.ts",
	],
	testEnvironment: 'node',
	rootDir: './',
	roots: ['<rootDir>/src'],
	transform: {
		'^.+\\.ts?$': 'ts-jest',
	},
}
module.exports = {
	collectCoverage: true,
	coverageReporters: ['lcov', 'text-summary'],
	coverageThreshold: {
		statements: 100,
		branches: 100,
		functions: 100,
		lines: 100,
	},
	collectCoverageFrom: [
		"./src/**/*.ts",
	],
	testEnvironment: 'node',
	rootDir: './',
	roots: ['<rootDir>/src'],
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
	},
}

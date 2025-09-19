module.exports = {
	clearMocks: true,
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
		"!<rootDir>/src/mocks/**",
		"!<rootDir>/src/stacks/*.ts",
	],
	testEnvironment: 'node',
	rootDir: './',
	roots: ['<rootDir>/src'],
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
	transform: {
		'^.+\\.ts?$': 'ts-jest',
	},
	// testMatch: [ '<rootDir>/src/someFile.test.tsx' ], //Left here intentionally to test single files easy
}
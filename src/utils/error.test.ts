import { getErrorMessage } from './error'

describe('Error Utils', () => {
	it('Should return the error message when given an Error instance.', () => {
		const error = new Error('Something went wrong')
		const result = getErrorMessage(error)

		expect(result).toBe('Something went wrong')
	})

	it('Should returns "Unknown error occurred" when given a string.', () => {
		const result = getErrorMessage('not-an-error')

		expect(result).toBe('Unknown error occurred')
	})

	it('Should return "Unknown error occurred" when given null.', () => {
		const result = getErrorMessage(null)
		expect(result).toBe('Unknown error occurred')
	})

	it('Should return "Unknown error occurred" when given an arbitrary object.', () => {
		const result = getErrorMessage({ message: 'fake' })

		expect(result).toBe('Unknown error occurred')
	})
})
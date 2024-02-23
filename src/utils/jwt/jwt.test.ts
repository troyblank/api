import { parseJwt } from './jwt'

describe('JWT Util', () => {
	it('should able able to parse a jwt', async () => {
		const jwtString: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJncmVldGluZyI6IkhlbGxvIGZyb20gYSBqd3QhIn0.uNs6mtvLKgtvmm8Bt8QYzm8Dnf37JIJTpijKEvgxH9E'

		expect(parseJwt(jwtString)).toStrictEqual({
			greeting: 'Hello from a jwt!',
		})
	})

	it('should able able to not parse a jwt if no string is given', async () => {
		expect(async() => parseJwt()).rejects.toThrow('JWT is not valid.')
	})
})

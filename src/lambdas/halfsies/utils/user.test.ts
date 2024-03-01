import { getUserName } from './user'

describe('User util', () => {

	it('should be able to get a user name', async () => {
		const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2duaXRvOnVzZXJuYW1lIjoiU3VzaWUifQ.8Eh6SeoGs_cUKMo_Ca4rLpWIBIEFQvSSfmiBtu2Lwl4'
		const headers = {
			Authorization: `Bearer ${jwt}`,
		}

		expect(getUserName(headers)).toBe('Susie')
	})
})

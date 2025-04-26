import { Chance } from 'chance'
import { MAIN_USER_NAME } from '../../../config'
import { isUserNameTheMainUserName } from './auth'

describe('Auth Util', () => {
	const chance = new Chance()

	it('should be able to determine if the userName is the main userName', async () => {
		expect(isUserNameTheMainUserName(MAIN_USER_NAME)).toBe(true)
		expect(isUserNameTheMainUserName(chance.word({ syllables: 4 }))).toBe(false)
	})
})

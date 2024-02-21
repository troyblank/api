import { Chance } from 'chance'
import { type NewLog } from '../types'

const chance = new Chance()

export const mockNewLog = (): NewLog => ({
	amount: chance.floating({ fixed: 2 }),
	description: chance.sentence(),
})

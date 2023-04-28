import { NewBalanceDbItemType } from '../../types'

export const generateNewBalanceDbItem = (newBalance: number): NewBalanceDbItemType => ({
	id: { N: '0' },
	balance: { N: newBalance.toString() },
})

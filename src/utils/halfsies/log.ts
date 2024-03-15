export const isALog = (log: any): boolean => typeof log.amount === 'number' && typeof log.description === 'string'

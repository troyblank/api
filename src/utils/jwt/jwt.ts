export const parseJwt = (token: string = ''): any => {
	if (!token) {
		throw new Error('JWT is not valid.')
	}

	return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
}

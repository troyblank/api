export const mockApiGatewayProxyEvent = (body: any, overrides: any = {}): unknown => ({
	body: JSON.stringify(body),
	headers: {
		Authorization: 'thisWouldBeABearerNotAToken eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoidHJveSJ9.jU-I2DX7lK76Je9h8uH7yfxmCaWmWRU0SQEjDDvO96k',
	},
	...overrides,
})

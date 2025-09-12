import { sendCustomResourceLambdaResponse } from './lambdas'
import { request as httpsRequest } from 'https'
import { Chance } from 'chance'
import type { ClientRequest } from 'http'

jest.mock('https', () => ({
	request: jest.fn(),
}))

describe('Lambdas Utils', () => {
	const chance = new Chance()
	const mockEnd = jest.fn()
	const mockWrite = jest.fn()

	beforeEach(() => {
		jest.mocked(httpsRequest).mockImplementation((_opts: any, callback?: any) => {
			const res = {
				on: jest.fn((event: string, handler: (...args: any[]) => void) => {
					if (event === 'end') setImmediate(handler)
					return res
				}),
			} as any

			if (callback) callback(res)

			const req: any = {
				on: jest.fn(() => req),
				write: mockWrite,
				end: mockEnd,
			}

			return req
		})
	})

	it('Should send SUCCESS response with the correct body.', async () => {
		const event = {
			ResponseURL: `https://${chance.domain()}/path?query=1`,
			StackId: chance.guid(),
			RequestId: chance.guid(),
			LogicalResourceId: chance.word(),
			PhysicalResourceId: chance.word(),
		}

		await sendCustomResourceLambdaResponse(event as any, true)

		const [options] = (httpsRequest as jest.Mock).mock.calls[0]

		expect(options.method).toBe('PUT')
		expect(options.hostname).toBe(new URL(event.ResponseURL).hostname)

		const body = mockWrite.mock.calls[0][0]
		const parsed = JSON.parse(body)

		expect(parsed.Status).toBe('SUCCESS')
		expect(parsed.Reason).toBe('See CloudWatch Logs')
		expect(parsed.PhysicalResourceId).toBe(event.PhysicalResourceId)
		expect(parsed.StackId).toBe(event.StackId)
		expect(parsed.RequestId).toBe(event.RequestId)
		expect(parsed.LogicalResourceId).toBe(event.LogicalResourceId)
		expect(parsed.Data).toEqual({})
	})

	it('Should send a FAILED response with error message.', async () => {
		const event = {
			ResponseURL: `https://${chance.domain()}/path?query=1`,
			StackId: chance.guid(),
			RequestId: chance.guid(),
			LogicalResourceId: chance.word(),
			PhysicalResourceId: chance.word(),
		}
		const errorMsg = chance.sentence()

		await sendCustomResourceLambdaResponse(event as any, false, errorMsg)
	})

	it('Should reject if https.request emits an error.', async () => {
		const mockErrorHandler = jest.fn()

		jest.mocked(httpsRequest).mockImplementation(() => {
			const req: Partial<ClientRequest> = {
				on: (event: string, handler: (...args: any[]) => void) => {
					if (event === 'error') {
						mockErrorHandler.mockImplementation(handler)
					}
					return req
				},
				write: mockWrite,
				end: mockEnd,
			} as any

			return req as ClientRequest
		})

		const event = {
			ResponseURL: `https://${chance.domain()}/path?query=1`,
			StackId: chance.guid(),
			RequestId: chance.guid(),
			LogicalResourceId: chance.word(),
			PhysicalResourceId: chance.word(),
		}
		const promise = sendCustomResourceLambdaResponse(event as any, true)
		const error = new Error('network fail')

		mockErrorHandler(error)

		await expect(promise).rejects.toThrow('network fail')
	})

	it('Uses LogicalResourceId when PhysicalResourceId is missing', async () => {
		const event = {
			ResponseURL: `https://${chance.domain()}/path`,
			StackId: chance.guid(),
			RequestId: chance.guid(),
			LogicalResourceId: 'MyLogicalId',
		} as any

		await sendCustomResourceLambdaResponse(event, true)

		const body = mockWrite.mock.calls[0][0]
		const parsed = JSON.parse(body)

		expect(parsed.PhysicalResourceId).toBe(event.LogicalResourceId)
	})
})

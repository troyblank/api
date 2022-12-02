import { APIGatewayProxyResult } from 'aws-lambda'

export const handler: Function = async function (): Promise<APIGatewayProxyResult> {
    return {
        statusCode: 200,
        body: 'Hello from Lambda ts!'
    }
}

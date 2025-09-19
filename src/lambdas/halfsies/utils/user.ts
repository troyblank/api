import { type APIGatewayProxyEventHeaders } from 'aws-lambda'
import { parseJwt } from '../../../utils/jwt'

export const getUserName = (headers: APIGatewayProxyEventHeaders): string => parseJwt(headers?.Authorization?.split(' ')[1])['cognito:username']

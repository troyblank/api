import { AuthorizationType, type Authorizer, type MethodOptions } from 'aws-cdk-lib/aws-apigateway'
import { MAIN_USER_NAME } from '../../../config'

export const requiresAuthorization = (authorizer: Authorizer): MethodOptions => ({
	authorizationType: AuthorizationType.COGNITO,
	authorizer,
})

export const isUserNameTheMainUserName = (userName: string): Boolean => userName === MAIN_USER_NAME

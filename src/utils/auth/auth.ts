import { AuthorizationType, type Authorizer, type MethodOptions } from 'aws-cdk-lib/aws-apigateway'

export const requiresAuthorization = (authorizer: Authorizer): MethodOptions => ({
	authorizationType: AuthorizationType.COGNITO,
	authorizer,
})



import { StackProps } from 'aws-cdk-lib'
import { DomainName } from 'aws-cdk-lib/aws-apigateway'
import { UserPool } from 'aws-cdk-lib/aws-cognito'

export interface FoodHowStackProps extends StackProps {
	apiDomainName: DomainName,	
	accessControlAllowOrigin: string,
	resourcePostFix: string,
	userPool: UserPool
}

import { StackProps } from 'aws-cdk-lib'
import { DomainName } from 'aws-cdk-lib/aws-apigateway'
import { UserPool } from 'aws-cdk-lib/aws-cognito'

export type HalfsieLog = {
	amount: number,
	user: string,
	date: string,
	description: string,
	id: number,
}

export interface HalfsiesStackProps extends StackProps {
	apiDomainName: DomainName,
	accessControlAllowOrigin: string,
	resourcePostFix: string,
	userPool: UserPool
}

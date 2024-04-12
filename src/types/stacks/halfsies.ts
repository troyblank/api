import { StackProps } from 'aws-cdk-lib'
import { UserPool } from 'aws-cdk-lib/aws-cognito'

export type HalfsieLog = {
	amount: number,
	user: string,
	date: string,
	description: string,
	id: number,
}

export interface HalfsiesStackProps extends StackProps {
	accessControlAllowOrigin: string,
	customDomainCertificateARN: string,
	customDomainName: string,
	resourcePostFix: string,
	userPool: UserPool
}

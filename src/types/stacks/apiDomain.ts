import { StackProps } from 'aws-cdk-lib'

export interface APIDomainStackProps extends StackProps {
	domainCertificateARN: string,
	domainName: string,
}

/* istanbul ignore file */
import { Construct } from 'constructs'
import { Stack } from 'aws-cdk-lib'
import { DomainName, EndpointType } from 'aws-cdk-lib/aws-apigateway'
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager'
import { APIDomainStackProps } from '../types/stacks/apiDomain'

// ----------------------------------------------------------------------------------------
// CUSTOM DOMAIN NAME
// ----------------------------------------------------------------------------------------
// This stack allows sharing an api for multiple services by using BasePathMapping (subDomain.domain.com/{app}/{endpoint})
// To get a custom domain working you must
// 1. Get a Certificate using AWS Certificate Manager (on us-east-1 ONLY) and add a DNS CNAME record from your domain provider.
// 2. Setup your domain provider's DNS Records CNAME record to add the "API Gateway domain name" with a period at the end (found in API Gateway > Custom domain names) 

// ----------------------------------------------------------------------------------------
// WHEN DELETING THIS IN CLOUD FORMATION
// ----------------------------------------------------------------------------------------
// Be sure to remove the api DNS records made under your custom domain name on your your domain provider's. (You will have to re-add this if re-deploy - your cert is on us-east-1).

export class APIDomainStack extends Stack {
	public domainName: DomainName

	constructor(scope: Construct, id: string, props: APIDomainStackProps) {
		super(scope, id, props)

		const {
			domainName,
			domainCertificateARN,
		} = props

		this.domainName = new DomainName(this, 'ApiDomain', {
			domainName,
			certificate: Certificate.fromCertificateArn(this, 'ApiCert', domainCertificateARN),
			endpointType: EndpointType.EDGE,
		})
	}
}

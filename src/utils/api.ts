import { Certificate } from 'aws-cdk-lib/aws-certificatemanager'
import { DomainName } from 'aws-cdk-lib/aws-apigateway'

export const getApiDomain = (customDomainCertificateARN: string) => {
	return new DomainName(this, 'ApiDomain', {
		domainName: 'api.troyblank.com',
		certificate: Certificate.fromCertificateArn(this, 'ApiCert', customDomainCertificateARN),
		endpointType: EndpointType.EDGE,
	})
}
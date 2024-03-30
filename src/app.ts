#!/usr/bin/env node
/* istanbul ignore file */
import 'source-map-support/register'
import { App } from 'aws-cdk-lib'
import { AuthStack, HalfsiesStack } from './stacks'

const app = new App()
const { blankFamilyUserPool } = new AuthStack(app, 'Auth', {
	stackName: 'Auth',
	env: {
		region: 'us-east-2',
	},
})
new HalfsiesStack(
	app,
	'Halfsies',
	{
		stackName: 'Halfsies',
		customDomainCertificateARN: 'arn:aws:acm:us-east-1:382713793519:certificate/700ed0de-e320-4c84-b377-9984263f610d',
		customDomainName: 'api.troyblank.com',
		resourcePostFix: 'Prod',
		userPool: blankFamilyUserPool,
		env: {
			region: 'us-east-2',
		},
	},
)
new HalfsiesStack(
	app,
	'Halfsies-Stage',
	{
		stackName: 'Halfsies-Stage',
		customDomainCertificateARN: 'arn:aws:acm:us-east-1:382713793519:certificate/74c434a7-2ad0-4477-8a50-e3b41218f85a',
		customDomainName: 'stage-api.troyblank.com',
		resourcePostFix: 'Stage',
		userPool: blankFamilyUserPool,
		env: {
			region: 'us-east-2',
		},
	},
)

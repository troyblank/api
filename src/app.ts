#!/usr/bin/env node
/* istanbul ignore file */
import 'source-map-support/register'
import { App } from 'aws-cdk-lib'
import {
	APIDomainStack,
	AuthStack,
	FoodHowStack,
	HalfsiesStack,
} from './stacks'

const app = new App()
const ENV_REGION = 'us-east-2'
const { blankFamilyUserPool } = new AuthStack(app, 'Auth', {
	stackName: 'Auth',
	env: {
		region: ENV_REGION,
	},
})

// PROD
const PROD_API_DOMAIN_CERTIFICATE_ARN = 'arn:aws:acm:us-east-1:382713793519:certificate/700ed0de-e320-4c84-b377-9984263f610d'
const PROD_API_DOMAIN_NAME = 'api.troyblank.com'
const PROD_RESOURCE_POSTFIX = 'Prod'

const { domainName: prodDomainName } = new APIDomainStack(
	app,
	'ApiDomain',
	{
		stackName: 'ApiDomain',
		domainName: PROD_API_DOMAIN_NAME,
		domainCertificateARN: PROD_API_DOMAIN_CERTIFICATE_ARN,
		env: { region: ENV_REGION },
	},
)

new FoodHowStack(
	app,
	'FoodHow',
	{
		stackName: 'FoodHow',
		apiDomainName: prodDomainName,
		resourcePostFix: PROD_RESOURCE_POSTFIX,
		accessControlAllowOrigin: 'https://foodhow.troyblank.com',
		userPool: blankFamilyUserPool,
		env: { region: ENV_REGION },
	},
)
new HalfsiesStack(
	app,
	'Halfsies',
	{
		stackName: 'Halfsies',
		apiDomainName: prodDomainName,
		resourcePostFix: PROD_RESOURCE_POSTFIX,
		accessControlAllowOrigin: 'https://halfsies.troyblank.com',
		userPool: blankFamilyUserPool,
		env: { region: ENV_REGION },
	},
)

// STAGE
const STAGE_API_DOMAIN_CERTIFICATE_ARN = 'arn:aws:acm:us-east-1:382713793519:certificate/74c434a7-2ad0-4477-8a50-e3b41218f85a'
const STAGE_API_DOMAIN_NAME = 'stage-api.troyblank.com'
const STAGE_RESOURCE_POSTFIX = 'Stage'
const STAGE_ACCESS_CONTROL_ALLOW_ORIGIN = '*'

const { domainName: stageDomainName } = new APIDomainStack(
	app,
	'ApiDomain-Stage',
	{
		stackName: 'ApiDomain-Stage',
		domainName: STAGE_API_DOMAIN_NAME,
		domainCertificateARN: STAGE_API_DOMAIN_CERTIFICATE_ARN,
		env: { region: ENV_REGION },
	},
)

new FoodHowStack(
	app,
	'FoodHow-Stage',
	{
		stackName: 'FoodHow-Stage',
		apiDomainName: stageDomainName,
		resourcePostFix: STAGE_RESOURCE_POSTFIX,
		accessControlAllowOrigin: STAGE_ACCESS_CONTROL_ALLOW_ORIGIN,
		userPool: blankFamilyUserPool,
		env: { region: ENV_REGION },
	},
)
new HalfsiesStack(
	app,
	'Halfsies-Stage',
	{
		stackName: 'Halfsies-Stage',
		apiDomainName: stageDomainName,
		resourcePostFix: STAGE_RESOURCE_POSTFIX,
		accessControlAllowOrigin: STAGE_ACCESS_CONTROL_ALLOW_ORIGIN,
		userPool: blankFamilyUserPool,
		env: { region: ENV_REGION },
	},
)

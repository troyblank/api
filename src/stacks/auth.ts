/* istanbul ignore file */
import { Construct } from 'constructs'
import { Duration, Stack, StackProps } from 'aws-cdk-lib'
import { Mfa, UserPool } from 'aws-cdk-lib/aws-cognito'

export class AuthStack extends Stack {
	public blankFamilyUserPool: UserPool

	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props)

		// ----------------------------------------------------------------------------------------
		// BLANK FAMILY USER POOL
		//
		// Setup users with AWS ui then manually verify with 
		// aws cognito-idp admin-set-user-password --user-pool-id [USER POOL ID] --username [USER NAME] --password "[TEMP PASSWORD]"" --permanent
		// ----------------------------------------------------------------------------------------
		this.blankFamilyUserPool = new UserPool(this, 'blankFamily', {
			selfSignUpEnabled: false,
			signInAliases: {
				email: true,
			},
			mfa: Mfa.OPTIONAL,
			passwordPolicy: {
				tempPasswordValidity: Duration.days(15),
				minLength: 8,
				requireLowercase: false,
				requireUppercase: false,
				requireDigits: false,
				requireSymbols: true,
			},
		})

		this.blankFamilyUserPool.addClient('blankFamilyClient', {
			authFlows: {
				adminUserPassword: true,
				custom: true,
				userPassword: true,
				userSrp: true,
			},
		})
	}
}

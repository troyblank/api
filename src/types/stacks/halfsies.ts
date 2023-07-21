import { StackProps } from 'aws-cdk-lib'
import { UserPool } from 'aws-cdk-lib/aws-cognito'

export interface HalfsiesStackProps extends StackProps {
	blankFamilyUserPool: UserPool
}

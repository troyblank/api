# AWS APIs

## Global Requirements
* awscli (`yarn install aws-sdk`)
* nvm

## Credentials

AWS credentials needs to be configured before you can run any CDK commands, do this be following these steps:

1. Go to "Security credentials" in your avatar menu.
2. Click "Create access key" and keep the secret key handy.
3. Run `aws configure` and input the values of your new key.

## Setup
1. run `nvm use`
2. run `yarn install`

# Commands
| Command     | Result |
| ----------- | ----------- |
| yarn bootstrap  | anytime you update aws-cdk you must boostrap the project |
| yarn synth      | synthesizes stack to check for errors before deploying   |
| yarn deploy     | deploys couldformation stack to AWS                      |

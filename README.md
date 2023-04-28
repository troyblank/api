# AWS APIs

## Global Requirements
* awscli (`npm install aws-sdk`)
* nvm

## Setup
1. run `nvm use`
2. run `npm install`

# Commands
| Command     | Result |
| ----------- | ----------- |
| npm run bootstrap  | anytime you update aws-cdk you must boostrap the project |
| npm run synth      | synthesizes stack to check for errors before deploying   |
| npm run deploy     | deploys couldformation stack to AWS                      |

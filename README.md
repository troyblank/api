# AWS APIs
[![Build Status](https://travis-ci.org/troyblank/api.svg?branch=master)](https://travis-ci.org/troyblank/api)
[![Coverage Status](https://coveralls.io/repos/github/troyblank/api/badge.svg?branch=master)](https://coveralls.io/github/troyblank/api?branch=master)

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

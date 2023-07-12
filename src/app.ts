#!/usr/bin/env node
/* istanbul ignore file */
import 'source-map-support/register'
import { App } from 'aws-cdk-lib'
import { AuthStack, HalfsiesStack } from './stacks'

const app = new App()
const { blankFamilyUserPool } = new AuthStack(app, 'Auth', { stackName: 'Auth' })
new HalfsiesStack(app, 'Halfsies', { stackName: 'Halfsies', blankFamilyUserPool})

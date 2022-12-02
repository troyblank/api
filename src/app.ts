#!/usr/bin/env node
/* istanbul ignore file */
import 'source-map-support/register'
import { App } from 'aws-cdk-lib'
import { HalfsiesStack } from './stacks'

const app = new App()
new HalfsiesStack(app, 'Halfsies', {
    stackName: 'Halfsies'
})
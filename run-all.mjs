#!/usr/bin/env node
import {runSuite}from'./experiments/suite.mjs';
const result=await runSuite();console.log(JSON.stringify(result,null,2));

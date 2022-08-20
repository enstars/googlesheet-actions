import {writeFileSync} from 'fs';
import * as core from '@actions/core';
// import sheet from './sheet';

process.on('unhandledRejection', handleError);
// main().catch(handleError);

async function main(): Promise<void> {
  try {
    const sheetID = core.getInput('sheet-id');
    core.info(sheetID);
    // const data = await sheet(sheetID);
    const data = {};
    writeFileSync(`${process.env.HOME}/data.json`, data, 'utf-8');
    core.setOutput('result', JSON.stringify(data, null, 2));
  } catch (error) {
    core.setFailed(error.message);
  }
}

function handleError(err: any): void {
  /* eslint-disable no-console */
  console.error(err);
  /* eslint-enable no-console */
  core.setFailed(`Unhandled error: ${err}`);
}

core.setOutput('result', '{}');

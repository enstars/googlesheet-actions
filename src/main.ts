/* eslint-disable github/array-foreach */
import {writeFileSync} from 'fs';
import * as core from '@actions/core';
import sheet from './sheet';

process.on('unhandledRejection', handleError);
main().catch(handleError);

async function main(): Promise<void> {
  try {
    const sheetID = core.getInput('sheet-id');
    const repo = core.getInput('repo');
    const path = core.getInput('path');
    core.info(sheetID);
    const data = await sheet(sheetID);
    core.info(`${data?.length} entries`);
    data
      .filter(s => {
        s.name.startsWith(repo);
      })
      .forEach(sheet => {
        const sheetPath = sheet.name.replace(`${repo}/`, '');
        writeFileSync(
          sheetPath.replace('.json', '.max.json'),
          JSON.stringify(sheet.data, undefined, 2)
        );
        writeFileSync(sheetPath, JSON.stringify(sheet.data));
      });
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

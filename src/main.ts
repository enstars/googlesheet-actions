/* eslint-disable github/array-foreach */
import {writeFileSync} from 'fs';
import * as core from '@actions/core';
import sheet from './sheet';

process.on('unhandledRejection', handleError);
main().catch(handleError);

async function main(): Promise<void> {
  try {
    const sheetID = core.getInput('sheet-id');
    const repo = core.getInput('repo').split('/')[1];
    // const path = core.getInput('path');
    core.info(sheetID);
    const data = await sheet(sheetID);
    core.info(`${data?.length} entries`);
    core.info(core.getInput('repo'));
    core.info(repo);

    data
      .filter((s: any) => s.name.startsWith(repo))
      .forEach((s: any) => {
        const sheetPath = `${process.env.GITHUB_WORKSPACE}/${s.name.replace(
          `${repo}/`,
          ''
        )}`;
        // core.info(JSON.stringify(process.env, undefined, 2));
        core.info(sheetPath);

        writeFileSync(
          sheetPath.replace('.json', '-max.json'),
          JSON.stringify(s.data, undefined, 2)
        );
        writeFileSync(sheetPath, JSON.stringify(s.data));
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

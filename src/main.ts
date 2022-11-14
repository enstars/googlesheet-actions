/* eslint-disable github/array-foreach */
import {writeFileSync, mkdirSync} from 'fs';
import * as core from '@actions/core';
import sheet from './sheet';
import axios from 'axios';

const TEST_SHEET_ID = '1NdrCTFzbeqN-nvlLzy8YbeBbNwPnHruIe95Q1eE4Iyk';
const TEST_REPO = 'data';
const SEARCH_KEY = process.env.SEARCH_KEY;

const unflatten = require('flat').unflatten;

process.on('unhandledRejection', handleError);
main().catch(handleError);

async function main(): Promise<void> {
  try {
    const sheetID = core.getInput('sheet-id') || TEST_SHEET_ID;
    const repo = core.getInput('repo').split('/')[1] || TEST_REPO;
    // const path = core.getInput('path');
    core.info(sheetID);
    const data = await sheet(sheetID);
    core.info(`${data?.length} entries`);
    core.info(core.getInput('repo'));
    core.info(repo);

    const sourcePath = process.env.GITHUB_WORKSPACE;
    // const sourcePath = __dirname;
    data
      .filter((s: any) => s.name.split('/')[0] === repo)
      .forEach((s: any) => {
        const sheetPath = `${sourcePath}/${s.name.replace(`${repo}/`, '')}`;
        // const sheetPath = `${s.name.replace(`${repo}/`, '')}`;
        const sheetDir = sheetPath
          .split('/')
          .slice(0, -1)
          .join('/');
        // core.info(JSON.stringify(process.env, undefined, 2));
        core.info(sheetPath);
        core.info(sheetDir);

        mkdirSync(sheetDir, {recursive: true});
        writeFileSync(
          sheetPath.replace('.json', '.max.json'),
          `${JSON.stringify(s.data, undefined, 2)}\n`
        );
        writeFileSync(sheetPath, `${JSON.stringify(s.data)}\n`);

        if (s.config.search) {
          core.info(s.config.search.key);
          const dataLocale = s.name.split('/')[1].replace('.json', '');
          const dataType = s.name.split('/')[2].replace('.json', '');
          const {key, params, localizedParams} = s.config.search;

          const updateData = s.data
            .map(item => {
              const unflatItem = unflatten(item);
              const result = {};
              params.forEach(param => {
                result[param] = unflatItem?.[param];
              });
              localizedParams.forEach(param => {
                result[`${dataLocale}__${param}`] = unflatItem?.[param];
              });
              return result;
            })
            .filter(p => p[key]);
          axios.put(
            `http://puka.ensemble.moe/indexes/${dataType}/documents?primaryKey=${key}`,
            updateData,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${core.getInput('search_key') ||
                  SEARCH_KEY}`
              }
            }
          );
        }
      });
    // core.setOutput('result', JSON.stringify(data, null, 2));
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

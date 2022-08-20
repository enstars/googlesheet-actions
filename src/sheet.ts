/* eslint-disable github/array-foreach */
import axios from 'axios';

const unflatten = require('flat').unflatten;

interface StringMap {
  [key: string]: string;
}

export default async function sheet<T>(sheetId = ''): Promise<T[] | []> {
  if (!sheetId) throw new Error('Need a Google sheet id to load');
  else
    try {
      const resultsJson = await (
        await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?includeGridData=true&key=AIzaSyACADWLTjCH0zpxiXCOLgMJJh3CxflBac4`
        )
      ).data;
      const sheetData = resultsJson.sheets[0].data[0].rowData.slice(
        resultsJson.sheets[0].properties.gridProperties.frozenRowCount - 1
      );
      const header = sheetData[0].values.map(
        v => v.userEnteredValue.stringValue
      );

      const sheetUnflattened = sheetData.slice(1).map(row => {
        const dataRow = row.values.map(v => v.userEnteredValue.stringValue);
        const obj = {};
        header.forEach((h, i) => {
          const data = dataRow[i];

          // only make the field actually null if data is __null;
          // else, just remove the field entirely to reduce json size
          if (data === '__null') {
            obj[h] = null;
          } else if (data !== 'null') {
            try {
              obj[h] = JSON.parse(dataRow[i]);
            } catch {
              // strings are just put in directly
              obj[h] = dataRow[i];
            }
          }
        });

        return unflatten(obj);
      });
      // console.log(header);
      // console.log('res', sheetUnflattened);
      return sheetUnflattened;
    } catch (error) {
      throw error;
    }
}

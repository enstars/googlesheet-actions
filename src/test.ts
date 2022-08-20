import sheet from './sheet';

async function a() {
  const res = await sheet('1NdrCTFzbeqN-nvlLzy8YbeBbNwPnHruIe95Q1eE4Iyk');
  return res;
}

a().then(value => console.log(value));
// console.log();

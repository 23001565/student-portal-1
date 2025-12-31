const csvParser = require('csv-parser');
const streamifier = require('streamifier');

function parseCSVBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = streamifier.createReadStream(buffer);
    stream
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

module.exports = {
  parseCSVBuffer,
};

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
import * as util from 'util';
import * as fs from 'fs';
const readFile = util.promisify(fs.readFile);

const app = express();

app.get('/*', async (req, res) => {
  const fileName = req.params[0];
  if (!fileName) {
    return res.status(400).json({ error: 'Missing file parameter' });
  }

  const filePath = path.join(
    __dirname,
    '../web/browser/assets/data',
    `${fileName}.json`
  );
  try {
    console.log({ filePath });
    const data = await readFile(filePath, 'utf-8');
    return res.json(JSON.parse(data));
  } catch (error) {
    return res.status(500).json({ error: 'Error reading file' });
  }
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);

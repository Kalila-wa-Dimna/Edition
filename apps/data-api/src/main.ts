/* eslint-disable @typescript-eslint/ban-ts-comment */
import express from 'express';
import * as util from 'util';
import * as fs from 'fs';
import { filePath, imagePath } from './constants';
const readFile = util.promisify(fs.readFile);

const app = express();

app.use('/images', express.static(imagePath));

app.get('/data/*', async (req, res) => {
  //@ts-ignore
  const fileName = req.params[0];
  if (!fileName) {
    return res.status(400).json({ error: 'Missing file parameter' });
  }

  try {
    const data = await readFile(filePath(fileName), 'utf-8');
    return res.json(JSON.parse(data));
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ error: 'Error reading file' });
  }
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);

import fs from 'fs';
import path from 'path';

const hashTablePath = path.join(import.meta.dirname, '../dist/hash-table.json');
const targetFilePath = path.join(import.meta.dirname, '../dist/index.html');

fs.readFile(hashTablePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading hash-table.json:', err);
    return;
  }

  const hashTable = JSON.parse(data);

  fs.readFile(targetFilePath, 'utf8', (err, htmlData) => {
    if (err) {
      console.error('Error reading index.html:', err);
      return;
    }

    let updatedHtml = htmlData;

    if (hashTable['main.css']) {
      updatedHtml = updatedHtml.replace(/main\.css/g, hashTable['main.css']);
    }

    if (hashTable['app.js']) {
      updatedHtml = updatedHtml.replace(/app\.js/g, hashTable['app.js']);
    }

    fs.writeFile(targetFilePath, updatedHtml, 'utf8', (err) => {
      if (err) {
        console.error('Error writing updated index.html:', err);
        return;
      }

      console.log('Paths updated successfully in index.html');
    });
  });
});
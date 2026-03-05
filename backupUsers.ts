import fs from 'fs';

const backupPath = './backups/backup.json';
const DATA_FILE = 'Users_data.json';
const DIRECTORY = './backups';

if (!fs.existsSync(DIRECTORY)) {
  fs.mkdirSync(DIRECTORY);
}

const readStream = fs.createReadStream(DATA_FILE, 'utf8');
const writeStream = fs.createWriteStream(backupPath, 'utf8');

readStream.pipe(writeStream);

writeStream.on('finish', () => {
  console.log('Backup created!!!');
});

readStream.on('error', (err: NodeJS.ErrnoException) => {
  console.error('Error reading:', err);
});

writeStream.on('error', (err: NodeJS.ErrnoException) => {
  console.error('Error writing:', err);
});

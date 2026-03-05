import { Injectable } from '@nestjs/common';
import fs from 'fs';
@Injectable()
export class FileHelpers {
  readFile<T = unknown[]>(filePath: string): Promise<T> {
    return new Promise((resolve, reject) => {
      let fileData = '';
      const readStream = fs.createReadStream(filePath, 'utf8');

      readStream.on('data', (chunk: string) => {
        fileData += chunk;
      });

      readStream.on('end', () => {
        try {
          const data =
            fileData.trim().length > 0
              ? (JSON.parse(fileData) as T)
              : ([] as T);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      });

      readStream.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'ENOENT') {
          resolve([] as T);
        } else {
          reject(error);
        }
      });
    });
  }

  writeFile<T = unknown[]>(filePath: string, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(filePath, {
        flags: 'w',
        encoding: 'utf8',
      });

      writeStream.write(JSON.stringify(data, null, 2) + '\n');
      writeStream.end();

      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  }
}

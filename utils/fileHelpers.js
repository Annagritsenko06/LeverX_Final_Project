import fs from 'fs';

export function readFile(filePath) {
    return new Promise((resolve, reject) => {
        let fileData = '';
        const readStream = fs.createReadStream(filePath, 'utf8');

        readStream.on('data', (chunk) => {
            fileData += chunk;
        });

        readStream.on('end', () => {
            try {
                const data =
                    fileData.trim().length > 0 ? JSON.parse(fileData) : [];
                resolve(data);
            } catch (error) {
                reject(error);
            }
        });

        readStream.on('error', (error) => {
            if (error.code === 'ENOENT') {
                resolve([]);
            } else {
                reject(error);
            }
        });
    });
}

export function writeFile(filePath, data) {
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

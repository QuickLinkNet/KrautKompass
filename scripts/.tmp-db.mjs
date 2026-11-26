import { Client } from 'basic-ftp';
process.loadEnvFile('.env.deploy');
const c = new Client(60000);
await c.access({ host: process.env.FTP_HOST, user: process.env.FTP_USER, password: process.env.FTP_PASSWORD, port: Number(process.env.FTP_PORT || 21), secure: process.env.FTP_SECURE === 'true' });
await c.downloadTo(process.argv[2], process.env.REMOTE_BASE_DIR.replace(/\/+$/, '') + '/storage/database.sqlite');
c.close();

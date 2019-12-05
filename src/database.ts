import { SyncOptions } from 'sequelize';
import LibraryCatalogue from './LibraryCatalogue'
export const models = [
    LibraryCatalogue,
];

export const syncOptions: SyncOptions = {
    alter: false,
    force: process.env.DB_FORCE == 'true',
    logging: false,
};

export default {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dialect: process.env.DB_DIALECT,
    storage: process.env.DB_STORAGE_PATH,
    port: Number(process.env.DB_PORT),
    // timezone: '+03:00'
};

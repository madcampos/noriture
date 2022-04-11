import Dexie, { type Table } from 'dexie';
import type { Feed } from '../feeds';

const DATABASE_VERSION = import.meta.env.APP_VERSION;

export class Database extends Dexie {
  feeds!: Table<Feed>;

  constructor() {
    super('noriture');
    this.version(DATABASE_VERSION).stores({
      feeds: '&id, &name, &url, category'
    });
  }
}

export const database = new Database();

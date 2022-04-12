import Dexie, { type Table } from 'dexie';
import type { Feed } from '../feeds';
import type { FeedItem } from '../feeds/feedItem';

const DATABASE_VERSION = import.meta.env.APP_VERSION;

export class Database extends Dexie {
  feeds!: Table<Feed, Feed['id']>;
  feedItems!: Table<FeedItem, FeedItem['id']>;

  constructor() {
    super('noriture');
    this.version(DATABASE_VERSION).stores({
      feeds: '&id, name, &url, category, type, displayType',
      feedItems: '&id, title, &url, date, feedId'
    });
  }
}

export const database = new Database();

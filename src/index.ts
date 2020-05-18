import { DbMockConfig, DbMockTableConfig } from './types';
import { bootstrap } from './db-mock';

export default async (config: DbMockConfig) => {
  const { createTableFile } = await bootstrap(config);

  return {
    addTable: <T = any>(config: DbMockTableConfig<T>) => createTableFile<T>(config)
  };
};

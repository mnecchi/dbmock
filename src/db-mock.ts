import { DbMockConfig, DbMockTableConfig } from './types';
import fs = require('fs');

type ICreateTableFile = <T>(config: DbMockTableConfig<T>) => Promise<{
  get: (id?: string) => T | T[],
  put: (id: string, data: T) => T
}>;

// Bootstrap: creates the db folder and files
export const bootstrap = async ({ path }: DbMockConfig): Promise<{
  createTableFile: ICreateTableFile
}> => {
  // generic function that reads from a "table" file
  const getObject = <T>(path: string): { [x: string]: T } => JSON.parse(fs.readFileSync(path, 'utf-8'));

  // function that writes to a "table" file
  const putObject = (path: string, data: any) =>
    fs.writeFileSync(path, JSON.stringify(data, null, ' '), 'utf-8');

  const createTableFile: ICreateTableFile = async <T>({ name, defaultData }: DbMockTableConfig<T>) => {
    const tablePath = `${path}/${name.trim()}.json`;

    const get = (id?: string): T | T[] =>
      id === undefined ? Object.values(getObject<T>(tablePath)) : getObject<T>(tablePath)[id];

    const put = (id: string, data: T): T => {
      const dbData = getObject<T>(path);
      dbData[id] = { ...data };
      putObject(path, dbData);
      return data;
    };

    if (!fs.existsSync(tablePath)) {
      const data = (defaultData ?? []).reduce((acc, item) => {
        acc[item.id] = item as T;
        return acc;
      }, {} as {[ x:string]: T });
      fs.writeFileSync(tablePath, JSON.stringify(data, null, ' '));
    }

    return { get, put };
  };

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }

  return { createTableFile };
};

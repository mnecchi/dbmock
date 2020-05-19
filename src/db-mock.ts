import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

import { DbMockConfig, DbMockTableConfig } from './types';

type IAddTable = <T>(config: DbMockTableConfig<T>) => Promise<{
  get: (id?: string) => Promise<T | T[]>,
  put: (id: string, data: T) => Promise<T>
}>;

const defaultJsonFormatter = (o: any): string => JSON.stringify(o, null, ' ');

// Bootstrap: creates the db folder and files
const DbMock = async ({ path, jsonFormatter = defaultJsonFormatter}: DbMockConfig): Promise<{
  addTable: IAddTable
}> => {
  // generic function that reads from a "table" file
  const getObject = async <T>(path: string): Promise<{ [x: string]: T }> => JSON.parse(readFileSync(path, 'utf-8'));

  // function that writes to a "table" file
  const putObject = (path: string, data: any) => writeFileSync(path, jsonFormatter(data), 'utf-8');

  const addTable: IAddTable = async <T>({ name, seed }: DbMockTableConfig<T>) => {
    const tablePath = `${path}/${name.trim()}.json`;

    const get = async (id?: string): Promise<T | T[]> => 
      id === undefined ? Object.values(await getObject<T>(tablePath)) : (await getObject<T>(tablePath))[id];

    const put = async (id: string, data: T): Promise<T> => {
      const dbData = await getObject<T>(tablePath);
      dbData[id] = { ...data };
      putObject(tablePath, dbData);
      return data;
    };

    if (!existsSync(tablePath)) {
      const data = (seed ?? []).reduce((acc, item) => {
        acc[item.id] = item as T;
        return acc;
      }, {} as {[ x:string]: T });
      writeFileSync(tablePath, jsonFormatter(data));
    }

    return { get, put };
  };

  if (!existsSync(path)) {
    mkdirSync(path);
  }

  return { addTable };
};

export default DbMock;

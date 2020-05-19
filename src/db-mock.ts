import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { v1 as uuidv1 } from 'uuid';

import { DbMockConfig, DbMockTableConfig } from './types';

type IAddTable = <T>(config: DbMockTableConfig<T>) => Promise<{
  get: (id?: string) => Promise<T | T[]>,
  put: (data: T) => Promise<T>
}>;

const defaultJsonFormatter = (o: any): string => JSON.stringify(o, null, ' ');

// generic function that reads from a "table" file
const getObject = async <T>(path: string): Promise<{ [x: string]: T } & { id: string }> => JSON.parse(readFileSync(path, 'utf-8'));

// function that writes to a "table" file
const putObject = (jsonFormatter: (o: any) => string) => (path: string, data: any) => writeFileSync(path, jsonFormatter(data), 'utf-8');

// Bootstrap: creates the db folder and files
const DbMock = async ({ path, jsonFormatter = defaultJsonFormatter}: DbMockConfig): Promise<{
  addTable: IAddTable
}> => {
  const addTable: IAddTable = async <T>({ name, seed }: DbMockTableConfig<T>) => {
    const tablePath = join(path, `${name.trim()}.json`);

    const get = async (id?: string): Promise<T | T[]> => 
      id === undefined ? Object.values(await getObject<T>(tablePath)) : (await getObject<T>(tablePath))[id];

      const put = async (data: T & { id? : string }): Promise<T> => {
      const { id = uuidv1() } = data;
      const dbData = await getObject<T>(tablePath);
      dbData[id] = { ...data, id };
      putObject(jsonFormatter)(tablePath, dbData);
      return dbData[id] as T & { id: string };
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
    mkdirSync(path, { recursive: true });
  }

  return { addTable };
};

export default DbMock;

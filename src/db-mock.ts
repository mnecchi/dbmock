import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

import { DbMockConfig, DbMockTableConfig } from './types';

type IAddTable = <T>(config: DbMockTableConfig<T>) => Promise<{
  get: (id?: string) => T | T[],
  put: (id: string, data: T) => T
}>;

const defaulJsonFormatter = (o: any): string => JSON.stringify(o, null, ' ');

// Bootstrap: creates the db folder and files
const DbMock = async ({ path, jsonFormatter = defaulJsonFormatter}: DbMockConfig): Promise<{
  addTable: IAddTable
}> => {
  // generic function that reads from a "table" file
  const getObject = <T>(path: string): { [x: string]: T } => JSON.parse(readFileSync(path, 'utf-8'));

  // function that writes to a "table" file
  const putObject = (path: string, data: any) =>
    writeFileSync(path, jsonFormatter(data), 'utf-8');

  const addTable: IAddTable = async <T>({ name, defaultData }: DbMockTableConfig<T>) => {
    const tablePath = `${path}/${name.trim()}.json`;

    const get = (id?: string): T | T[] =>
      id === undefined ? Object.values(getObject<T>(tablePath)) : getObject<T>(tablePath)[id];

    const put = (id: string, data: T): T => {
      const dbData = getObject<T>(path);
      dbData[id] = { ...data };
      putObject(path, dbData);
      return data;
    };

    if (!existsSync(tablePath)) {
      const data = (defaultData ?? []).reduce((acc, item) => {
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

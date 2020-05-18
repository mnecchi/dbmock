import DbMock, { DbMockConfig, DbMockTableConfig } from '../src';
import * as fs from 'fs';

const jsonFormatter = (o: any) => JSON.stringify(o);

const testConfig: DbMockConfig = {
  path: './db',
  jsonFormatter,
};

type TestTableData = { id: string, value: string };

const testTableConfig: DbMockTableConfig<TestTableData> = {
  name: 'table',
};

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('db-mock bootstrapping', () => {
  it('should create the db folder if it does not exist', async () => {
    jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => false);
    const mockedMkdir = jest.spyOn(fs, 'mkdirSync');

    await DbMock(testConfig);
    expect(mockedMkdir).toHaveBeenCalledWith(testConfig.path);
  });

  it('should not create the db folder if it does exist already', async () => {
    jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => true);
    const mockedMkdir = jest.spyOn(fs, 'mkdirSync');

    await DbMock(testConfig);
    expect(mockedMkdir).not.toHaveBeenCalled();
  });
});

describe('add a new table', () => {
  it('should create the table file if it does not exist', async () => {
    const mockedExists = jest.spyOn(fs, 'existsSync');
    mockedExists.mockImplementationOnce(() => true);

    const { addTable } = await DbMock(testConfig);

    const mockedWriteFile = jest.spyOn(fs, 'writeFileSync');
    mockedExists.mockImplementationOnce(() => false);

    await addTable(testTableConfig);
    expect(mockedWriteFile).toHaveBeenCalledWith(`${testConfig.path}/${testTableConfig.name}.json`, jsonFormatter({}));
  });

  it('should create the table file with default data if it does not exist', async () => {
    const mockedExists = jest.spyOn(fs, 'existsSync');
    mockedExists.mockImplementationOnce(() => true);

    const { addTable } = await DbMock(testConfig);

    const mockedWriteFile = jest.spyOn(fs, 'writeFileSync');
    mockedExists.mockImplementationOnce(() => false);
    testTableConfig.defaultData = [{ id: 'data_id', value: 'test'}, { id: 'data_id2', value: 'test2'}];
    const expectedData = testTableConfig.defaultData.reduce((acc, defaultData) => {
      acc[defaultData.id] = defaultData;
      return acc;
    }, {} as { [id: string]: TestTableData});

    await addTable(testTableConfig);
    expect(mockedWriteFile).toHaveBeenCalledWith(`${testConfig.path}/${testTableConfig.name}.json`, jsonFormatter(expectedData));
  });

  it('should not create the table file if it does exist already', async () => {
    const mockedExists = jest.spyOn(fs, 'existsSync');
    mockedExists.mockImplementationOnce(() => true);

    const { addTable } = await DbMock(testConfig);

    const mockedWriteFile = jest.spyOn(fs, 'writeFileSync');
    mockedExists.mockImplementationOnce(() => true);
    await addTable(testTableConfig);
    expect(mockedWriteFile).not.toHaveBeenCalled();
  });
});

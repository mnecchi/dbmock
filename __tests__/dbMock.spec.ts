import DbMock, { DbMockConfig, DbMockTableConfig } from '../src';
import * as fs from 'fs';

const jsonFormatter = (o: any) => JSON.stringify(o);

const testConfig: DbMockConfig = {
  path: 'db',
  jsonFormatter
};

type TestTableData = { id?: string; value: string };

const testTableConfig: DbMockTableConfig<TestTableData> = {
  name: 'table'
};

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn()
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
    expect(mockedWriteFile).toHaveBeenCalledWith(
      `${testConfig.path}/${testTableConfig.name}.json`,
      jsonFormatter({})
    );
  });

  it('should create the table file with default data if it does not exist', async () => {
    const mockedExists = jest.spyOn(fs, 'existsSync');
    mockedExists.mockImplementationOnce(() => true);

    const { addTable } = await DbMock(testConfig);

    const mockedWriteFile = jest.spyOn(fs, 'writeFileSync');
    mockedExists.mockImplementationOnce(() => false);
    testTableConfig.seed = [ { id: 'data_id', value: 'test' }, { id: 'data_id2', value: 'test2' } ];
    const expectedData = testTableConfig.seed.reduce(
      (acc, seed) => {
        acc[seed.id] = seed;
        return acc;
      },
      {} as { [id: string]: TestTableData }
    );

    await addTable(testTableConfig);
    expect(mockedWriteFile).toHaveBeenCalledWith(
      `${testConfig.path}/${testTableConfig.name}.json`,
      jsonFormatter(expectedData)
    );
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

describe('get data from the db', () => {
  const testObject1 = { id: '1', value: 'test1' };
  const testObject2 = { id: '2', value: 'test2' };

  it('should return an array of objects if id is not passed', async () => {
    jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() =>
      JSON.stringify({
        '1': testObject1,
        '2': testObject2
      })
    );

    const { addTable } = await DbMock(testConfig);
    const { get } = await addTable({ ...testTableConfig, seed: [ testObject1, testObject2 ] });

    expect(await get()).toEqual([ testObject1, testObject2 ]);
  });

  it('should return an object with the specified id', async () => {
    jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() =>
      JSON.stringify({
        '1': testObject1,
        '2': testObject2
      })
    );

    const { addTable } = await DbMock(testConfig);
    const { get } = await addTable({ ...testTableConfig, seed: [ testObject1, testObject2 ] });

    expect(await get('2')).toEqual(testObject2);
  });
});

describe('save data on the db', () => {
  const seed = [ { id: '1', value: 'test1' } ];
  const mockedWriteFile = jest.spyOn(fs, 'writeFileSync');

  it('should add the object to the table file', async () => {
    jest.spyOn(fs, 'readFileSync').mockImplementation(() =>
      JSON.stringify({
        '1': seed[0]
      })
    );

    const { addTable } = await DbMock(testConfig);
    const { put } = await addTable({ ...testTableConfig, seed } as DbMockTableConfig<TestTableData>);

    const testData: TestTableData = { value: 'test2' };
    mockedWriteFile.mockClear();

    const data = await put(testData);
    expect(data).toEqual({
      ...testData,
      id: expect.stringMatching(
        /(?:[a-f]|[0-9]){8}-(?:[a-f]|[0-9]){4}-(?:[a-f]|[0-9]){4}-(?:[a-f]|[0-9]){4}-(?:[a-f]|[0-9]){12}/
      )
    });
    expect(mockedWriteFile).toHaveBeenLastCalledWith(
      `${testConfig.path}/${testTableConfig.name}.json`,
      jsonFormatter({ '1': seed[0], [data.id as string]: { ...testData, id: data.id } }),
      'utf-8'
    );
  });

  it('should update the object if it exists and write it to the table file', async () => {
    jest.spyOn(fs, 'readFileSync').mockImplementation(() =>
      JSON.stringify({
        '1': seed[0]
      })
    );

    const { addTable } = await DbMock(testConfig);
    const { put } = await addTable({ ...testTableConfig, seed } as DbMockTableConfig<TestTableData>);

    const testData = { id: '1', value: 'test1new' };
    mockedWriteFile.mockClear();

    const data = await put(testData);
    expect(data).toEqual(testData);
    expect(mockedWriteFile).toHaveBeenLastCalledWith(
      `${testConfig.path}/${testTableConfig.name}.json`,
      jsonFormatter({ '1': testData }),
      'utf-8'
    );
  });
});

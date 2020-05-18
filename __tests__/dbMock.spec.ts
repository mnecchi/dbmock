import DbMock from '../src';
import { DbMockConfig } from '../src/types';

const testConfig: DbMockConfig = {
  path: './db'
};

it('should', async () => {
  const { addTable } = await DbMock(testConfig);
  const { get, put } = await addTable<{ id: string, value: string }>({ name: 'test1', defaultData: [{
    id: '1', value: 'OK!'
  }] });
  expect(get('1')).toEqual({
    id: '1', value: 'OK!'
  });
});

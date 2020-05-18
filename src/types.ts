export interface DbMockConfig {
  path: string;
}


export interface DbMockTableConfig<T> { name: string; defaultData?: (T & { id: string })[] }

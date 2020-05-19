export interface DbMockConfig {
  path: string;
  jsonFormatter?: (o: any) => string;
}

export interface DbMockTableConfig<T> { name: string; seed?: (T & { id: string })[] }

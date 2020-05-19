# db-mock

## a simple json based db for development environments

### install

```sh
npm install --save-dev db-mock
```
or
```
yarn add --dev db-mock
```

### usage

```ts
import DbMock from 'db-mock';

interface Person { 
    name: string;
}

const newPerson: Person = { name: 'Albert Einstein' };

const { addTable } = await DbMock({ path: './data/db' });
const { get, put } = await addTable<Person>({ name: 'persons' });

await put('id1', newPerson);
const person = await get('id1');

console.log(person); // { id: 'id1', name: 'Albert Einstein' }
```


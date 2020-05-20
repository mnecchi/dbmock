# dev-dbmock

## a simple json based db for development environments

The aim of this project is to provide a mock db for local developments.
The db is composed of json files which can then be easily inspected for debug.
The stored objects can be totally arbitrary with the only restriction that they must have a string property called `id`.
When the object is stored in the db an `id` is created automatically (in a guid-like format) if not already provided.

### install

```sh
npm install --save-dev dev-dbmock
```
or
```
yarn add --dev dev-dbmock
```

### usage

The first thing you need to do is creating the db like this:

*Typescript*:
```ts
import DbMock, { DbMockConfig, DbMockTableConfig } from 'dev-dbmock';

const config: DbMockConfig = { path: 'db/data' };
const { addTable } = await DbMock(config);
```

*Javascript*:
```js
import DbMock from 'dev-dbmock';

const config = { path: 'db/data' };
const { addTable } = await DbMock(config);
```

The only config options are:
- **path** (required): the path of the folder were you want to create your db files
- **jsonFormatter** (optional): a function that gets an object and returns a string with the json representation. The default one is: `(o: any): string => JSON.stringify(o, null, ' ')`

Once the db has been created you can start adding a "table" like this:

*Typescript*:
```ts
interface Person {
    id?: string;
    name: string;
}

const tableConfig: DbMockTableConfig = { name: 'persons' };
const { get, put } = await addTable<Person>(DbMockTableConfig);
```

*Javascript*:
```js
const tableConfig =  { name: 'persons' };
const { get, put } = await addTable(DbMockTableConfig);
```

The table config has this properties:
- **name** (required): the name of the table. The json file for the table will be called `[name].json` (what a surprise!)
- **seed** (optional): an array of objects to be initially stored in the table. The object **must** all have an `id` already.

Once the table is create you can start adding object to it like this:

*Typescript*:
```ts
const newPerson: Person = { name: 'John Lennon' };
const { id } = await put(newPerson);
```

*Javascript*:
```js
const newPerson = { name: 'John Lennon' };
const { id } = await put(newPerson); 
```

If you want to do an update you can just call **put** with an object with a `id`.

You can retrieve all the objects in the table like this:

*Typescript:*
```ts
const persons = await get() as Person[];
```

*Javascript:*
```js
const persons = await get();
```

If you want to get just one object instead you can call **get** passing the `id` of the object:

*Typescript*:
```ts
const person = await get(id) as Person;
```

*Javascript*:
```js
const person = await get(id);
```

### Example

*Typescript*:

```ts
interface Person {
    id?: string;
    name: string;
}
    
const { addTable } = await DbMock({ path: './db/data' });
const { get, put } = await addTable<Person>({ name: 'persons' });
    
// write a record to the db
const newPerson1: Person = { name: 'John Lennon' };
const { id: id1 } = await put(newPerson1);
const person1 = await get(id1) as Person;
console.log(person1); // { id: '[id1]', name: 'John Lennon' }

// write another record
const newPerson2: Person = { name: 'Paul McCartney' };
const { id: id2 } = await put(newPerson2);
const person2 = await get(id2) as Person;
console.log(person2); // { id: '[id2]', name: 'Paul McCartney' }
console.log(await get()); // [{ id: '[id1]', name: 'John Lennon' }, { id: '[id2]', name: 'Paul McCartney' }]

// update a record
await put({ id: id1, name: 'George Harrison' });
await put({ id: id2, name: 'Ringo Starr' });
console.log(await get()); // [{ id: '[id1]', name: 'George Harrison' }, { id: '[id2]', name: 'Ringo Starr' }]
```

*Javascript*:
```js
const { addTable } = await DbMock({ path: './db/data' });
const { get, put } = await addTable({ name: 'persons' });
    
// write a record to the db
const newPerson1 = { name: 'John Lennon' };
const { id: id1 } = await put(newPerson1);
const person1 = await get(id1);
console.log(person1); // { id: '[id1]', name: 'John Lennon' }

// write another record
const newPerson2 = { name: 'Paul McCartney' };
const { id: id2 } = await put(newPerson2);
const person2 = await get(id2);
console.log(person2); // { id: '[id2]', name: 'Paul McCartney' }
console.log(await get()); // [{ id: '[id1]', name: 'John Lennon' }, { id: '[id2]', name: 'Paul McCartney' }]

// update a record
await put({ id: id1, name: 'George Harrison' });
await put({ id: id2, name: 'Ringo Starr' });
console.log(await get()); // [{ id: '[id1]', name: 'George Harrison' }, { id: '[id2]', name: 'Ringo Starr' }]
```



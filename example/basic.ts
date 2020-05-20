// tslint:disable: no-console
import DbMock from '../src/dbmock';

(async () => {
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
})();

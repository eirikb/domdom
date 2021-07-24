import domdom from '@eirikb/domdom';

// Important part
interface User {
  name: string;
}

interface Data {
  users: User[];
}

const { React, init, don, path } = domdom<Data>({
  users: [{ name: 'Yup' }, { name: 'World' }, { name: 'Hello' }],
});

const view = (
  <ul>
    {don(path().users.$)
      .filter(user => user.name !== 'World')
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(user => (
        <li>{user.name}</li>
      ))}
  </ul>
);
// Important part

init(document.body, view);

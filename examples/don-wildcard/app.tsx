import domdom from '@eirikb/domdom';

// Important part
interface User {
  name: string;
}

interface Data {
  users: User[];
}

const { React, init, don, pathOf } = domdom<Data>({
  users: [{ name: 'Hello' }, { name: 'World' }],
});

const view = (
  <ul>
    {don(pathOf().users.$).map(user => (
      <li>{user.name}</li>
    ))}
  </ul>
);
// Important part

init(document.body, view);

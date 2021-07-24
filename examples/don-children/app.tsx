import domdom from '@eirikb/domdom';

// Important part
interface User {
  name: string;
}

interface Data {
  users: User[];
}

const { React, init, don, data, path } = domdom<Data>({
  users: [{ name: 'Hello' }, { name: 'World' }, { name: 'Yup' }],
});

const view = (
  <div>
    <ul>
      {don(path().users.$).map(user => (
        <li>{don(path(user).name)}</li>
      ))}
    </ul>
    <button onClick={() => (data.users[1].name = '🤷')}>Click me!</button>
  </div>
);
// Important part

init(document.body, view);

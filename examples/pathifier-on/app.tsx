import domdom from '@eirikb/domdom';

// Important part
interface User {
  name: string;
}

interface Data {
  users: User[];
  filter: string;
  desc: boolean;
}

const { React, init, don, path, data } = domdom<Data>({
  users: [{ name: 'Yup' }, { name: 'World' }, { name: 'Hello' }],
  filter: '',
  desc: false,
});

const view = (
  <div>
    <button id="desc" onClick={() => (data.desc = !data.desc)}>
      Toggle desc
    </button>
    <input type="text" placeholder="filter" dd-model="filter" />

    <ul>
      {don(path().users)
        .filterOn('filter', (user, { onValue }) => user.name.includes(onValue))
        .sortOn('desc', (a, b, { onValue }) =>
          onValue ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)
        )
        .map(user => (
          <li>{user.name}</li>
        ))}
    </ul>
  </div>
);
// Important part

init(document.body, view);

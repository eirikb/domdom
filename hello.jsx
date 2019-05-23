export default ({on, unset, set}) => {
  // on('test', res => {
  //   console.log('test is now', res);
  // });
  const o = <div>
    <button onClick={() => set('test', 'hello')}>Set</button>
    <button onClick={() => unset('test')}>Unset</button>
    <button onClick={() => set('testing', 'hello')}>Set 2</button>
    <button onClick={() => unset('testing')}>Unset 2</button>
    {on('test', (test) => <div>
        {test}
        <p>
          {on('testing', (test) => <span>eh  {test}</span>)}
        </p>
      </div>
    )}
  </div>;
  return o;
};

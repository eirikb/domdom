export default ({on, text, set, unset}) => {
  on('test', res => {
    console.log('test is now', res);
  });
  const o = <div>
    <button onClick={() => set('test', 'yes')}>Yes!</button>
    <button onClick={() => set('test', 'no')}>No!</button>
    <button onClick={() => unset('test')}>clear</button>
    <h1>{text('test')}</h1>
  </div>;
  return o;
};

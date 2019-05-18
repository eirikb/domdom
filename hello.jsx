export default ({on}) => {
  on('test', res => {
    console.log('test is now', res);
  });
  return <div>
       {on('test', (test) => <div>{test}</div>)}
  </div>
};

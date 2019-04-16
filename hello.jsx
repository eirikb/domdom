function Please() {
  return <div>ok :) {text('test')}</div>;
}

export default () => <div>
  Test!
  <button onClick={() => set('test', !get('test'))}>Click me!</button>
  test is {text('test')}

  <b>
    {on('test', (test) => <h1>Test is {test} and test really is {text('test')}</h1>)}
  </b>


  {when('test', () => <div>
    Ok, now what?
    <Please></Please>
  </div>)}
</div>
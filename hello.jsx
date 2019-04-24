function Please({React, text}) {
  return <div>ok :) {text('test')}</div>;
}

export default ({React, text, set, get, on, when}) => <div>
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
export default () => <div>
  <div>
    <input type="text" dd-model="input"/>
    <input type="text" dd-model="input"/>
    Input value: {text('input')}
  </div>
  <div>
    <button dd-on-click="incCounter">Inc counter</button>
    Counter: {text('counter')}
  </div>

  <div>
    <button dd-on-click="toggleShow">Toggle show</button>
  </div>
  <div dd-if="show">
    Show me ! :)

    <input type="text" dd-model="input"/>
    and wat is {text('input')}
  </div>

</div>
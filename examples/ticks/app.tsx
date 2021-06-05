import domdom from '@eirikb/domdom';

interface Data {
  run: boolean;
  tick: number;
}

const { React, init, don, pathOf, data } = domdom<Data>({
  run: false,
  tick: 0,
});

const view = (
  <div>
    <img
      src="https://i.imgur.com/rsD0RUq.jpg"
      style={don(pathOf().tick).map(tick => ({ rotate: `${tick % 180}deg` }))}
    />
    <button onClick={() => (data.run = !data.run)}>Start/Stop</button>
  </div>
);

(function loop(time) {
  if (data.run) {
    data.tick = time;
  }
  requestAnimationFrame(loop);
})(0);

init(document.body, view);

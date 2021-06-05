import domdom from '@eirikb/domdom';

type Route = 'panel-a' | 'panel-b';

interface Data {
  route: Route;
}

const { React, init, don, pathOf, data } = domdom<Data>({ route: 'panel-a' });

const PanelA = () => (
  <div>
    Panel A :) <button onclick={() => gotoRoute('panel-b')}>Next panel</button>
  </div>
);

const PanelB = () => <div>Panel B! (hash is: {window.location.hash})</div>;

const view = (
  <div>
    {don(pathOf().route).map((route: Route) => {
      switch (route) {
        case 'panel-b':
          return <PanelB />;

        default:
          return <PanelA />;
      }
    })}
  </div>
);

function gotoRoute(route: Route) {
  window.location.hash = route;
}

window.addEventListener(
  'hashchange',
  () => (data.route = window.location.hash.slice(1) as Route)
);

init(document.body, view);

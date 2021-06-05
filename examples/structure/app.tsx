import { data, don, init, pathOf, React } from './domdom';

const view = <div>Hello, {don(pathOf().hello)}</div>;

data.hello = 'There :)';

init(document.body, view);

import { data, don, init, path, React } from './domdom';

const view = <div>Hello, {don(path().hello)}</div>;

data.hello = 'There :)';

init(document.body, view);

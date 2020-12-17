import { Pathifier } from '@eirikb/data';
import { Domode, Mountable } from 'types';

export class DomPathifier extends Pathifier implements Mountable {
  mounted() {
    this.init();
  }

  unmounted() {
    this.off();
  }

  attach(node: Domode) {
    node.mountables.push(this);
    this.init();
  }
}

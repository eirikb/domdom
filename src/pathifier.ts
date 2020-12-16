import { Pathifier2 } from '@eirikb/data';
import { Domode, Mountable } from 'types';

export class Pathifier extends Pathifier2 implements Mountable {
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

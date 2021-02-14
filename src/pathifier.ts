import { Pathifier } from '@eirikb/data';
import { Mountable } from 'types';

export class DomPathifier extends Pathifier implements Mountable {
  mountables: Mountable[] = [];

  mounted() {
    this.init();
    this.mountables.forEach(m => m.mounted());
  }

  unmounted() {
    this.off();
    this.mountables.forEach(m => m.unmounted());
  }
}

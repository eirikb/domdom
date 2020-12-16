import { Pathifier2 } from '@eirikb/data';
import { Mountable } from 'types';

export class Pathifier extends Pathifier2 implements Mountable {
  mounted() {
    this.init();
  }

  unmounted() {
    this.off();
  }
}

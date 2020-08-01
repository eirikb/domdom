import { Data } from '@eirikb/data';
import { Domode } from 'types';

export class DomSquint {
  private readonly data: Data;
  private readonly parent: HTMLElement;

  constructor(data: Data, parent: HTMLElement) {
    this.data = data;
    this.parent = parent;
  }
  private mount(element: Node) {
    const domode = element as Domode;
    if (domode.mounted && !domode.isMounted) {
      domode.mounted(this.data);
      domode.isMounted = true;
    }
  }

  private static unmount(element: Node) {
    const domode = element as Domode;
    if (domode.unmounted) domode.unmounted();
    domode.isMounted = false;
  }

  init() {
    new MutationObserver(mutationList => {
      for (let mutation of mutationList) {
        mutation.addedNodes.forEach(node => {
          this.mount(node);
          const element = node as HTMLElement;
          if (element !== null && element.getElementsByTagName) {
            const children: Element[] = Array.from(
              element.getElementsByTagName('*')
            );
            for (let child of children) {
              this.mount(child);
            }
          }
        });
        mutation.removedNodes.forEach(node => {
          DomSquint.unmount(node);
          const element = node as HTMLElement;
          if (element !== null && element.getElementsByTagName) {
            const children: Element[] = Array.from(
              element.getElementsByTagName('*')
            );
            for (let child of children) {
              DomSquint.unmount(child);
            }
          }
        });
      }
    }).observe(this.parent, { childList: true, subtree: true });
  }
}

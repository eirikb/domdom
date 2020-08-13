import { Domode } from 'types';

export class DomSquint {
  private readonly parent: HTMLElement;

  constructor(parent: HTMLElement) {
    this.parent = parent;
  }
  private mount(element: Node) {
    const domode = element as Domode;
    if (domode.mounted && !domode.isMounted) {
      if (!domode.path) {
        domode.path = (domode.parentElement as Domode)?.path;
      }
      domode.mounted();
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

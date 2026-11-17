export interface Controls { w: boolean; a: boolean; s: boolean; d: boolean; interact: boolean }
export class Keyboard {
  private held = new Set<string>();
  private interaction = false;
  constructor() {
    window.addEventListener('keydown', event => {
      if (!['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyE'].includes(event.code)) return;
      event.preventDefault();
      if (event.code === 'KeyE' && !event.repeat && !this.held.has(event.code)) this.interaction = true;
      this.held.add(event.code);
    });
    window.addEventListener('keyup', event => this.held.delete(event.code));
    window.addEventListener('blur', () => { this.held.clear(); this.interaction = false; });
  }
  consume(): Controls {
    const controls = { w: this.held.has('KeyW'), a: this.held.has('KeyA'), s: this.held.has('KeyS'), d: this.held.has('KeyD'), interact: this.interaction };
    this.interaction = false;
    return controls;
  }
}

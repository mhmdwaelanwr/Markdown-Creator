// Debouncer utility for React Native
export class Debouncer {
  constructor(milliseconds) {
    this.milliseconds = milliseconds;
    this.timeout = null;
  }

  run(action) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(action, this.milliseconds);
  }

  dispose() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}

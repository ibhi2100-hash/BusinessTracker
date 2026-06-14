export class Scheduler {

  private timer?:
    ReturnType<
      typeof setInterval
    >;

  constructor(
    private sync:
      () => Promise<void>,

    private interval =
      30000
  ) {}

  start() {

    this.stop();

    this.timer =
      setInterval(
        () => {
          void this.sync();
        },
        this.interval
      );
  }

  stop() {

    if (this.timer) {

      clearInterval(
        this.timer
      );

      this.timer =
        undefined;
    }
  }
}
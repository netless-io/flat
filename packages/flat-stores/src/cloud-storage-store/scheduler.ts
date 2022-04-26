/**
 * This class is used to run some task() at some interval.
 */
export class Scheduler {
    private running = false;
    private timer = 0;

    public constructor(
        public readonly task: () => void | Promise<void>,
        public readonly interval: number,
    ) {}

    public start(): void {
        this.running = true;
        this.invoke();
    }

    public invoke = async (): Promise<void> => {
        window.clearTimeout(this.timer);
        await this.task();
        if (this.running) {
            this.timer = window.setTimeout(this.invoke, this.interval);
        }
    };

    public stop(): void {
        this.running = false;
        window.clearTimeout(this.timer);
    }
}

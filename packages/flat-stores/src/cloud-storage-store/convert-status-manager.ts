import { FileUUID } from "flat-components";

/**
 * @returns true: keep polling, false: stop
 */
export type ConvertTask = () => Promise<boolean>;

export class ConvertStatusManager {
    private tasks = new Map<FileUUID, { ticket: number; executor: ConvertTask }>();

    public hasTask(fileUUID: FileUUID): boolean {
        return this.tasks.has(fileUUID);
    }

    public async addTask(
        fileUUID: FileUUID,
        executor: ConvertTask,
        interval = 1500,
    ): Promise<void> {
        const task = this.tasks.get(fileUUID);
        if (task) {
            task.executor = executor;
        } else if (!(await executor())) {
            const ticket = window.setInterval(async () => {
                const task = this.tasks.get(fileUUID);
                if (!task) {
                    window.clearInterval(ticket);
                } else if (await task.executor()) {
                    this.cancelTask(fileUUID);
                }
            }, interval);
            this.tasks.set(fileUUID, { executor, ticket });
        }
    }

    public cancelTask(fileUUID: FileUUID): void {
        const task = this.tasks.get(fileUUID);
        if (task) {
            window.clearInterval(task.ticket);
            this.tasks.delete(fileUUID);
        }
    }

    public cancelAllTasks(): void {
        this.tasks.forEach(task => {
            window.clearInterval(task.ticket);
        });
        this.tasks.clear();
    }
}

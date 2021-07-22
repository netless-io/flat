import { tasks } from "./tasks";

void (async () => {
    for (const task of tasks) {
        // eslint-disable-next-line @typescript-eslint/await-thenable
        await task();
    }
})();

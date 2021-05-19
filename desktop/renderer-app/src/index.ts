import tasks from "./tasks";
import "./index.less";

void (async () => {
    for (const task of tasks) {
        // eslint-disable-next-line @typescript-eslint/await-thenable
        await task();
    }
})();

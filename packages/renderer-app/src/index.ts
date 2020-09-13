import tasks from "./tasks";

(async () => {
    for (const task of tasks) {
        await task();
    }
})();

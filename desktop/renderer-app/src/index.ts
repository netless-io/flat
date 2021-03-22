import tasks from "./tasks";
import "./index.less";

(async () => {
    for (const task of tasks) {
        await task();
    }
})();

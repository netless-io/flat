import runtime from "../utils/Runtime";

export default (context: Context) => {
    context.runtime = runtime;

    // @ts-ignore
    context.wins = {};
    global.runtime = context.runtime;
};

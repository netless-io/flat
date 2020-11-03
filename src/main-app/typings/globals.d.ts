declare namespace NodeJS {
    export interface Global {
        runtime: import("../src/utils/Runtime").Runtime;
    }
}

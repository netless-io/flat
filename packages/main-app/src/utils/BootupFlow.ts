export default async <C extends Context>(context: C, itemNames: ((c: C) => any)[]) => {
    for (const item of itemNames) {
        await item(context);
    }
    return context;
};

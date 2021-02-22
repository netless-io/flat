export default async (itemNames: (() => any)[]) => {
    for (const item of itemNames) {
        await item();
    }
};

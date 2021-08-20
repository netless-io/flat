export default async (itemNames: Array<() => any>): Promise<void> => {
    for (const item of itemNames) {
        await item();
    }
};

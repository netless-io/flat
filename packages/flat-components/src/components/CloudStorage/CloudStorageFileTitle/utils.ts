export const checkInvalidDirectoryName = (directoryName: string): boolean => {
    const invalidDirectoryName = /\\|\//;
    return invalidDirectoryName.test(directoryName);
};

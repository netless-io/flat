interface Window {
    isElectron?: boolean;
    node?: { path: { join(...args: string[]): string } };
}

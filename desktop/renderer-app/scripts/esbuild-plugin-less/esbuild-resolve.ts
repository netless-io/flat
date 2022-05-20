import esbuild from "esbuild";

export async function esbuildResolve(path: string, dir: string) {
    let resolved: string | null = null;
    await esbuild.build({
        stdin: {
            contents: `import ${JSON.stringify(path)}`,
            resolveDir: dir,
        },
        bundle: true,
        write: false,
        plugins: [
            {
                name: "resolve",
                setup({ onLoad }) {
                    onLoad({ filter: /.*/ }, args => {
                        resolved = args.path;
                        return { contents: "" };
                    });
                },
            },
        ],
    });
    return resolved;
}

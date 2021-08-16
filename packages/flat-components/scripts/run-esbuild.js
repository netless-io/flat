const { build } = require("esbuild");
const pkg = require("../package.json");
const fs = require("fs");

build({
    entryPoints: ["src/index.ts"],
    outfile: pkg.module,
    bundle: true,
    sourcemap: true,
    external: Object.keys({
        ...pkg.dependencies,
        ...pkg.peerDependencies,
    }),
    charset: "utf8",
    format: "esm",
    plugins: [
        {
            name: "custom",
            setup(build) {
                build.onLoad({ filter: /\.less$/ }, async _args => {
                    return { contents: "", loader: "css" };
                });
                build.onLoad({ filter: /\.svg$/ }, async args => {
                    const svg = await fs.promises.readFile(args.path, "utf8");
                    const base64 = Buffer.from(svg).toString("base64");
                    return {
                        contents: `data:image/svg+xml,${base64}`,
                        loader: "text",
                    };
                });
            },
        },
    ],
}).catch(() => process.exit(1));

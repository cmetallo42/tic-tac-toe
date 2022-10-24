import { build } from "esbuild";
import { networkInterfaces } from "os";
import { readFile } from "fs"
import { createConnection } from "net";
import { createServer } from "http";
import esbuildSvelte from "esbuild-svelte";

import { svelte } from "./svelte.config.js";

const defaultHost = "localhost";

const devel = process.argv.includes("--devel");
const update = process.argv.includes('--update');

const serve = ({ host, port, dir }) => {
    const mimes = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "gif": "image/gif",
        "png": "image/png",
        "svg": "image/svg+xml",
        "js": "text/javascript",
        "json": "application/json",
        "css": "text/css",
        "ico": "image/x-icon",
        "map": "application/json",
    };

    createServer((req, res) => {
        if (req.url.includes("/static") || req.url.includes("/build")) {
            console.info(`> ${dir + req.url} was requested`);

            readFile(dir + req.url, (err, data) => {
                const mime = mimes[req.url.split(".").pop()]

                if (err || !mime) {
                    res.writeHead(404);
                } else {
                    res.setHeader("Content-Type", mime)
                    res.writeHead(200);
                }
                
                res.end(data);
            });
        } else {
            console.info(`> index page was requested`);

            readFile(dir + "/index.html", (err, data) => {
                if (err) {
                    res.writeHead(404);
                    return;
                }

                res.setHeader("Content-Type", "text/html")
                res.writeHead(200);
                res.end(data);
            });
        }
    }).listen(port, host);

}

const host = () => {
    const ni = networkInterfaces();
  
    for (const name of Object.keys(ni)) {
        for (const net of ni[name]) {
            if (net.family == 4 && net.internal == false) {
                return net.address;
            }
        }
    }

    return defaultHost;
}

const port = (min, host = defaultHost) => check(min, host).then((free) => {
    if (free) {
        return min;
    }

    return port(min + 1, host);
})

const check = (port, host = defaultHost) => new Promise((resolve) => {
    const c = createConnection({ port: port, host: host }, () => {
        c.destroy(); resolve(false);
    });

    c.on('error', () => { resolve(true); });
})

const buildOptions = {
    sourcemap: devel ? "linked" : false,
    legalComments: 'external',
    sourcesContent: devel,
    minify: devel == false,
    treeShaking: true,

    bundle: true,
    outdir: update ? 'update' : 'public/build',
    platform: "browser",
    allowOverwrite: true,
    entryPoints: ["src/main.ts"],
    plugins: [esbuildSvelte(svelte(devel))],
};

if (devel) {
    buildOptions.watch = true;

    const serveOptions = {
        host: host(),
        dir: "public",
    };

    serveOptions.port = await port(3000, serveOptions.host);

    console.info(`> project started at http://${serveOptions.host}:${serveOptions.port}`);

    Promise.all([build(buildOptions), serve(serveOptions)]);
} else {
    build(buildOptions);

    console.info(`> project built to ${buildOptions.outdir} folder`);
}


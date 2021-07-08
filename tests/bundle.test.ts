import { DenoBundle, DenoTypings, DenoUtils } from '../index.ts';

const { BASE, PKG } = Deno.env.toObject();
if (!BASE || !PKG) throw new Error('env PKG is not set');

const root = `./${BASE}/${PKG}`;
const build = `${root}/build`;
const index = `index.ts`;

// optional
const map = new URL('import_map.json', import.meta.url).pathname;

// TODO: read package.json from module and append version to build @oscario2
const writeTypings = async () => {
    const dts = new DenoTypings(PKG, `${root}/${index}`);
    const data = await dts.getTypings(map);
    DenoUtils.writeFile(`${root}/build/${index.replace('.ts', '.d.ts')}`, data);
};

const writeBundle = async () => {
    const bundle = new DenoBundle(`${root}/index.ts`);
    const data = await bundle.getBundle(map);

    DenoUtils.writeFile(`${build}/index.js`, data['deno:///bundle.js']);
    DenoUtils.writeFile(`${build}/index.js.map`, data['deno:///bundle.js.map']);
};

await writeTypings();
await writeBundle();

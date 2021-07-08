export class DenoTypings {
    private decoder = new TextDecoder();

    /**
     * @param pkg module name to include or exlucde 'export' keyword
     * @param index index.ts file of module
     */
    constructor(private pkg: string, private index: string) {}

    /**
     * generate typings
     * @param importMap
     * @returns
     */
    public async getTypings(importMap?: string) {
        const typings = await Deno.emit(this.index, {
            compilerOptions: {
                declaration: true,
                emitDeclarationOnly: true,
                removeComments: false
            },
            importMapPath: importMap ?? undefined
        });

        return await this.bundleTypings(typings);
    }

    /**
     * if file start with @ts-skip
     * @param file
     */
    private async shouldIgnore(file: string) {
        const { rid } = await Deno.open(file);
        const buf = new Uint8Array(20);
        const _ = await Deno.read(rid, buf);
        Deno.close(rid);

        return this.decoder.decode(buf).includes('@ts-skip');
    }

    /**
     * combine and write typings
     * @param result
     */
    private async bundleTypings({ files }: Deno.EmitResult) {
        const fnames = Object.keys(files);
        const result = [];

        //
        for (const file of fnames) {
            const contents = files[file];
            const internal = !file.includes(this.pkg);
            if (contents.length == 0) continue;

            // should skip typings
            const src = file.replace('.d.ts', '').replace('file://', '');
            if (await this.shouldIgnore(src)) {
                console.log('[@ts-skip]', src.split('/').pop());
                continue;
            }

            const output = contents
                .split('\n')
                .map(line => {
                    // skip module path line
                    if (line.includes('/// <amd')) return null;

                    // skip default exports
                    if (line.includes('_default')) return null;

                    // remote module
                    if (line.includes('https://')) {
                        return line;
                    }

                    // exclude 'import' of local modules as we bundle the typings unless 'external'
                    if (line.includes('import {') || line.includes('import ')) {
                        return null;
                    }

                    // same as above but for 'export'
                    if (
                        line.includes('export *') ||
                        line.includes('export {') ||
                        line.includes('export type {')
                    ) {
                        return null;
                    }

                    // if export is not from our mod.ts, remove 'export' from .d.ts
                    if (internal) return line.replace('export ', '');

                    return line;
                })
                .filter(k => k);

            result.push(output.join('\n'));
        }

        return result.join('\n');
    }
}

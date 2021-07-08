export class DenoBundle {
    /**
     * @param index index.ts file of module
     */
    constructor(private readonly index: string) {}

    /**
     * generate bundle
     * @param importMap
     * @returns
     */
    public async getBundle(importMap?: string) {
        const bundle = await Deno.emit(this.index, {
            compilerOptions: {
                strict: true,
                experimentalDecorators: true,
                emitDecoratorMetadata: true,
                removeComments: true,
                esModuleInterop: true
            },
            bundle: 'module',
            importMapPath: importMap ?? undefined
        });
        return bundle.files;
    }
}

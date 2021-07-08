export class DenoUtils {
    /**
     *
     * @param name
     * @param data
     */
    public static async writeFile(name: string, data: string) {
        const folder = name.split('/').slice(0, -1).join('/');

        await Deno.mkdir(folder, { recursive: true });
        await Deno.writeTextFile(name, '// deno-lint-ignore-file\n' + data);

        console.log('Wrote', name);
    }
}

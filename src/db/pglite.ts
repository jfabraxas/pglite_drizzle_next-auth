import { PGlite } from '@electric-sql/pglite';
import { NodeFS } from '@electric-sql/pglite/nodefs';
import path from 'node:path';

type PGLiteInstance = InstanceType<typeof PGlite>;

let pglite: PGLiteInstance;

// const init: Promise<PGLiteInstance> = PGlite.create();

const dir = path.resolve(process.cwd(), 'db', 'pglite');

export async function getPglite(): Promise<PGLiteInstance> {
  if (!(pglite instanceof PGlite)) {
    pglite = await PGlite.create({
      fs: new NodeFS(dir),
      debug: 2,
    });
    await pglite.waitReady;
  }
  return pglite;
}

export { pglite };

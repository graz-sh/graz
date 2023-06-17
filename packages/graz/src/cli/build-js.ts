import * as esbuild from "esbuild";
import { globby } from "globby";

export const buildJs = async (format: esbuild.Format) => {
  const paths = await globby(["chains/**/*.ts"]);
  await esbuild.build({
    allowOverwrite: true,
    bundle: false,
    entryPoints: [...paths],
    format,
    outdir: "chains",
  });
};

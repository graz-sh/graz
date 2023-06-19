import * as esbuild from "esbuild";
import { globby } from "globby";

export const transpileSources = async (format: esbuild.Format) => {
  const paths = await globby(["chains/**/*.js"]);
  await esbuild.build({
    allowOverwrite: true,
    bundle: false,
    entryPoints: [...paths],
    format,
    outdir: "chains",
    treeShaking: true,
  });
};

import { createWriteStream, promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Stream } from "node:stream";
import { promisify } from "node:util";

import { got } from "got";
import tar from "tar";

const pipeline = promisify(Stream.pipeline);

export interface RepoInfo {
  username: string;
  name: string;
  branch: string;
  filePath?: string;
}

const downloadTar = async (url: string) => {
  const tempFile = join(tmpdir(), `next.js-cna-example.temp-${Date.now()}`);
  await pipeline(got.stream(url), createWriteStream(tempFile));
  return tempFile;
};

export const downloadAndExtractRepo = async (root: string, { username, name, branch, filePath }: RepoInfo) => {
  const tempFile = await downloadTar(`https://codeload.github.com/${username}/${name}/tar.gz/${branch}`);

  await tar.x({
    file: tempFile,
    cwd: root,
    strip: filePath ? filePath.split("/").length + 1 : 1,
    filter: (p) => p.startsWith(`${name}-${branch.replace(/\//g, "-")}${filePath ? `/${filePath}` : ""}`),
  });

  await fs.unlink(tempFile);
};

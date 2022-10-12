import { createWriteStream, promises as fs } from "fs";
import got from "got";
import { tmpdir } from "os";
import { join } from "path";
import { Stream } from "stream";
import tar from "tar";
import { promisify } from "util";

const pipeline = promisify(Stream.pipeline);

export interface RepoInfo {
  username: string;
  name: string;
  branch: string;
  filePath?: string;
}

async function downloadTar(url: string) {
  const tempFile = join(tmpdir(), `next.js-cna-example.temp-${Date.now()}`);
  await pipeline(got.stream(url), createWriteStream(tempFile));
  return tempFile;
}

export async function downloadAndExtractRepo(root: string, { username, name, branch, filePath }: RepoInfo) {
  const tempFile = await downloadTar(`https://codeload.github.com/${username}/${name}/tar.gz/${branch}`);

  await tar.x({
    file: tempFile,
    cwd: root,
    strip: filePath ? filePath.split("/").length + 1 : 1,
    filter: (p) => p.startsWith(`${name}-${branch.replace(/\//g, "-")}${filePath ? `/${filePath}` : ""}`),
  });

  await fs.unlink(tempFile);
}

import * as p from "@clack/prompts";

// https://github.com/natemoo-re/clack/blob/90f8e3d762e96fde614fdf8da0529866649fafe2/packages/prompts/src/index.ts#L785-L799
export interface Task {
  title: string;
  task: (message: (string: string) => void) => string | Promise<string> | Promise<void>;
  enabled?: boolean;
}

// https://github.com/natemoo-re/clack/blob/90f8e3d762e96fde614fdf8da0529866649fafe2/packages/prompts/src/index.ts#L804-L813
export const tasks = async ($tasks: Task[]) => {
  for await (const task of $tasks) {
    if (task.enabled === false) continue;
    const s = p.spinner();
    s.start(task.title);
    const result = await task.task(s.message);
    s.stop(result || task.title);
  }
};

export const withSpinner = <T>(fn: (s: ReturnType<typeof p.spinner>) => T) => {
  const s = p.spinner();
  return fn(s);
};

export * from "@clack/prompts";

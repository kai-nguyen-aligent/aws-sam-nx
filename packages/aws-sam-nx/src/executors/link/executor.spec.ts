import { ExecutorContext } from '@nx/devkit';

import { LinkExecutorSchema } from './schema';
import executor from './executor';

const options: LinkExecutorSchema = {};
const context: ExecutorContext = {
  root: '',
  cwd: process.cwd(),
  isVerbose: false,
};

describe('Link Executor', () => {
  it('can run', async () => {
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
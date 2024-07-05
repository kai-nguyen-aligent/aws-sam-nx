#!/usr/bin/env node

import * as cp from 'child_process';
import type { CreateWorkspaceOptions } from 'create-nx-workspace';
import { createWorkspace } from 'create-nx-workspace';
import * as ora from 'ora';
import yargs from 'yargs';

const DEFAULT_NODE_VERSION = '20.14';
const DEFAULT_PACKAGE_MANAGER = 'npm';

async function runCommand(
  command: string,
  args?: ReadonlyArray<string>,
  options?: cp.SpawnOptionsWithoutStdio
) {
  const message = `${command} ${args.join(' ')}`;
  const spinner = ora(`Starting: ${message}`).start();

  try {
    const result = await new Promise(function (resolve, reject) {
      const process = cp.spawn(command, args, options);

      process.stdout.on('data', (data) => {
        spinner.info(data.toString());
      });

      process.stderr.on('data', (data) => {
        spinner.warn(data.toString());
      });

      process.on('exit', function (code) {
        if (code !== 0) reject(code);
        resolve(code);
      });

      process.on('error', function (err) {
        reject(err);
      });
    });

    if (result !== 0) throw new Error(`${message} failed`);
    spinner.succeed(`${message} succeeded`);
  } catch (err) {
    spinner.fail((err as Error).message);
  } finally {
    spinner.stop();
  }
}

async function main() {
  const commandIndex = process.argv.findIndex((text) =>
    text.includes('create-aws-sam-nx')
  );

  const argv = await yargs(process.argv.slice(commandIndex + 1))
    .options({
      name: {
        type: 'string',
        demandOption: true,
        description: 'Set workspace name & directory (normally client name)',
      },
      nodeVersion: {
        type: 'string',
        default: DEFAULT_NODE_VERSION,
        description: 'Set Nodejs version',
      },
      packageManager: {
        type: 'string',
        default: DEFAULT_PACKAGE_MANAGER,
        description: 'Set package manager',
        choices: ['npm', 'pnpm', 'yarn'],
      },
    })
    .usage('Usage: $0 --name [name]')
    .showHelpOnFail(false, 'Specify --help for available options')
    .parse();

  const { name, packageManager } = argv;
  const nodeVersion = argv['nodeVersion'].trim().split('.');

  // This assumes "aws-sam-nx" and "create-aws-sam-nx" are at the same version
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const presetVersion = require('../package.json').version;

  ora(
    `Creating the workspace for: ${name}, using ${packageManager} and Nodejs v${nodeVersion.join(
      '.'
    )}`
  ).succeed();

  const { directory } = await createWorkspace(
    `@aligent/aws-sam-nx@${presetVersion}`,
    {
      name,
      presetVersion,
      nodeVersionMajor: nodeVersion[0],
      nodeVersionMinor: nodeVersion[1],
      nxCloud: 'skip',
      packageManager:
        packageManager as CreateWorkspaceOptions['packageManager'],
    }
  );

  ora('Prepare workspace dependencies').succeed();

  await runCommand('corepack', [packageManager, 'install'], { cwd: directory });
  await runCommand(packageManager, ['install'], { cwd: directory });

  ora(`Successfully created workspace: ${name}`).succeed();
}

main();

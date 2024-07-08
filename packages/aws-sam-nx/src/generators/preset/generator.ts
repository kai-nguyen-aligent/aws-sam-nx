import {
  Tree,
  formatFiles,
  generateFiles,
  updateJson,
  updateNxJson,
} from '@nx/devkit';
import latestVersion from 'latest-version';
import * as path from 'path';
import { nxJson } from './config/nx-json';
import * as packageJson from './config/package.json';
import { vsCodeExtensions } from './config/vscode-extensions';
import { PresetGeneratorSchema } from './schema';

export async function presetGenerator(
  tree: Tree,
  options: PresetGeneratorSchema
) {
  const projectRoot = `.`;
  const {
    name,
    presetVersion,
    nodeVersionMajor,
    nodeVersionMinor,
    packageManager,
  } = options;

  const packageManagerVersion = await latestVersion(packageManager);

  const tsConfigNodePackageName = `@tsconfig/node${nodeVersionMajor}`;
  const tsConfigNodeVersion = await latestVersion(tsConfigNodePackageName);

  updateJson(tree, '.vscode/extensions.json', () => {
    return { ...vsCodeExtensions };
  });

  updateNxJson(tree, {
    ...nxJson,
    generators: {
      '@aligent/aws-sam-nx': {
        brand: name,
        nodeVersionMajor,
      },
      ...nxJson.generators,
    },
  });

  updateJson(tree, 'package.json', (json) => {
    json = {
      name: `@${name}/integrations`,
      description: `${name} integrations mono-repository`,
      ...packageJson,
    };
    json.version = presetVersion;
    json.engines = {
      node: `^${nodeVersionMajor}.${nodeVersionMinor}.0`,
    };
    json.engines[`${packageManager}`] = `^${packageManagerVersion}`;
    json.devDependencies = {
      '@aligent/aws-sam-nx': presetVersion,
      '@aligent/aws-sam-nx-pipeline': presetVersion,
      ...json.devDependencies,
    };
    json.devDependencies[tsConfigNodePackageName] = `^${tsConfigNodeVersion}`;

    return json;
  });

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
  await formatFiles(tree);
}

export default presetGenerator;

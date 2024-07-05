import {
  Tree,
  formatFiles,
  generateFiles,
  updateJson,
  updateNxJson,
} from '@nx/devkit';
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

  updateJson(tree, '.vscode/extensions.json', () => {
    return { ...vsCodeExtensions };
  });

  updateNxJson(tree, {
    ...nxJson,
    generators: {
      '@aligent/aws-sam-nx': {
        brand: options.name,
        nodeVersionMajor: options.nodeVersionMajor,
      },
      ...nxJson.generators,
    },
  });

  //TODO: check current the package manager & @tsconfig/nodeXX version https://www.npmjs.com/package/latest-version
  const packageManagerVersion = `latest`;
  const tsConfigNodeVersion = `latest`;

  updateJson(tree, 'package.json', (json) => {
    json = {
      name: `@${options.name}/integrations`,
      description: `${options.name} integrations mono-repository`,
      ...packageJson,
    };
    json.version = options.presetVersion;
    json.engines = {
      node: `^${options.nodeVersionMajor}.${options.nodeVersionMinor}.0`,
    };
    json.engines[`${options.packageManager}`] = packageManagerVersion;
    json.devDependencies = {
      '@aligent/aws-sam-nx': options.presetVersion,
      '@aligent/aws-sam-nx-pipeline': options.presetVersion,
      ...json.devDependencies,
    };
    json.devDependencies[`@tsconfig/node${options.nodeVersionMajor}`] =
      tsConfigNodeVersion;

    return json;
  });

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
  await formatFiles(tree);
}

export default presetGenerator;

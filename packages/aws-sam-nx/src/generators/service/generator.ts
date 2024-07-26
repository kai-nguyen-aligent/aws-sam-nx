import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  OverwriteStrategy,
  Tree,
} from '@nx/devkit';
import * as path from 'path';
import { buildRunCommandConfig } from '../../utils/targets';
import { ServiceGeneratorSchema } from './schema';

function getTemplateFolder(type: ServiceGeneratorSchema['type'] = 'general') {
  if (type === 'notification') {
    return path.join(__dirname, 'notification-files');
  }

  return path.join(__dirname, 'general-files');
}

export async function serviceGenerator(
  tree: Tree,
  options: ServiceGeneratorSchema
) {
  const { name, type } = options;
  const projectRoot = `services/${name}`;

  addProjectConfiguration(tree, name, {
    root: projectRoot,
    projectType: 'application',
    sourceRoot: `${projectRoot}/src`,
    // KAI: consider using executors instead
    targets: {
      build: {
        ...buildRunCommandConfig('sam build'),
      },
      deploy: {
        ...buildRunCommandConfig('sam deploy'),
      },
      remove: {
        ...buildRunCommandConfig('sls delete'),
      },
      'check-types': {
        ...buildRunCommandConfig('tsc --noEmit --pretty'),
      },
      lint: {
        executor: '@nx/linter:eslint',
        outputs: ['{options.outputFile}'],
        options: {
          lintFilePatterns: [projectRoot + '/**/*.ts'],
          maxWarnings: 0,
        },
      },
      test: {
        executor: '@nx/vite:test',
        outputs: ['{options.reportsDirectory}'],
        options: {
          passWithNoTests: true,
          reportsDirectory: `../../coverage/${projectRoot}`,
        },
      },
    },
    tags: ['service', type, name],
  });

  // Add shared globals file
  generateFiles(tree, path.join(__dirname, 'base-files'), projectRoot, options);

  // Generate service-specific files
  const dir = getTemplateFolder(type);
  generateFiles(tree, dir, projectRoot, options, {
    overwriteStrategy: OverwriteStrategy.ThrowIfExisting,
  });

  await formatFiles(tree);
}

export default serviceGenerator;

import { NxJsonConfiguration } from '@nx/devkit';

export const nxJson: NxJsonConfiguration & { $schema: string } = {
  $schema: './node_modules/nx/schemas/nx-schema.json',
  defaultBase: 'origin/staging',
  generators: {
    '@nx/js:library': {
      projectNameAndRootFormat: 'derived',
      bundler: 'none',
      unitTestRunner: 'vitest',
    },
  },
  namedInputs: {
    default: ['{projectRoot}/**/*', 'sharedGlobals'],
    production: [
      'default',
      '!{projectRoot}/.eslintrc.json',
      '!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)',
      '!{projectRoot}/tsconfig.spec.json',
      '!{projectRoot}/jest.config.[jt]s',
      '!{projectRoot}/src/test-setup.[jt]s',
    ],
    sharedGlobals: [],
  },
  targetDefaults: {
    build: {
      dependsOn: ['^build'],
      inputs: ['production', '^production'],
      outputs: ['{projectRoot}/.aws-sam'],
      cache: true,
    },
    'check-types': {
      cache: true,
    },
    lint: {
      inputs: [
        'default',
        '{workspaceRoot}/.eslintrc.json',
        '{workspaceRoot}/.eslintignore',
      ],
      cache: true,
    },
    test: {
      inputs: ['default', '^production'],
      cache: true,
    },
  },
  workspaceLayout: {
    appsDir: 'services',
    libsDir: 'libs',
  },
};

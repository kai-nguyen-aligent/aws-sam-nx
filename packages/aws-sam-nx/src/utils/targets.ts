import { TargetConfiguration, TargetDependencyConfig } from '@nx/devkit';

export function buildRunCommandConfig(
  command: string,
  dir = '{projectRoot}',
  dependsOn?: (string | TargetDependencyConfig)[]
): TargetConfiguration {
  return {
    executor: 'nx:run-commands',
    options: {
      cwd: dir,
      color: true,
      command: command,
    },
    dependsOn,
  };
}

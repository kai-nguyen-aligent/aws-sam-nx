export interface PresetGeneratorSchema {
  name: string;
  presetVersion: string;
  nodeVersionMajor: number;
  nodeVersionMinor: number;
  packageManager: 'npm' | 'pnpm' | 'yarn';
}

import { ExecutorContext, PromiseExecutor } from '@nx/devkit';
import { LinkExecutorSchema } from './schema';

const runExecutor: PromiseExecutor<LinkExecutorSchema> = async (
  options: LinkExecutorSchema,
  context: ExecutorContext
) => {
  const { dependOn } = options;
  console.log(dependOn);

  const projects = context.projectsConfigurations.projects;

  for (const project in projects) {
    const name = projects[project].name;
    console.log('Project:', name);
  }
  return {
    success: true,
  };
};

export default runExecutor;

import getRuntimeSpecs from '../tester/runtimes';
import log from '../lib/log';
import { pluralize } from '../lib/pluralize';
import { StorySpec } from './extract';

interface GetStoriesOptions {
    isolatorUrl: string,
    verbose: boolean,
    allowConsoleErrors: boolean
}

const getStories = async ({ isolatorUrl, verbose, allowConsoleErrors }: GetStoriesOptions): Promise<StorySpec[]> => {
  const runtimeSpecs = await getRuntimeSpecs(isolatorUrl, { verbose, allowConsoleErrors });

  if (runtimeSpecs.length === 0) {
    throw new Error('Cannot run a build with no stories. Please add some stories!');
  }

  log.info('', `Found ${pluralize(runtimeSpecs.length, 'story')}`);
  return runtimeSpecs;
}

export default getStories;
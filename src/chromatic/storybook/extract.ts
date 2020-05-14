import { DOMWindow } from 'jsdom';

const CHROMATIC_PARAMETERS = [
  'viewports',
  'delay',
  'disable',
  'noScroll',
  'diffThreshold',
  'pauseAnimationAtEnd',
];

interface StorySpecComponent {
  name: string,
  displayName: string
}

interface StorySpecParameter {
  docsOnly: any,
  filename: string,
  framework: string
}

export interface StorySpec {
  storyId: string,
  name: string,
  component: StorySpecComponent[],
  parameters: StorySpecParameter[]
}

function specFromStory({
  id,
  kind,
  name,
  parameters: { chromatic, docsOnly, fileName, framework } = {} as any,
}: any): any {
  const param = (value: any) => (typeof value === 'function' ? value({ id, kind, name }) : value);
  return {
    storyId: id,
    name,
    component: {
      name: kind,
      displayName: kind.split(/\||\/|\./).slice(-1)[0],
    },
    parameters: {
      docsOnly,
      fileName: fileName && fileName.toString(),
      framework,
      ...(chromatic
        ? CHROMATIC_PARAMETERS.reduce(
          (acc, key) => (chromatic[key] ? { ...acc, [key]: param(chromatic[key]) } : acc),
          {}
        )
        : {}),
    },
  };
}

export const extract = (global: DOMWindow): StorySpec[] => {
  const { __STORYBOOK_CLIENT_API__ } = global;

  if (!__STORYBOOK_CLIENT_API__) {
    throw new Error(
      `Chromatic requires Storybook version at least 3.4. Please update your Storybook!`
    );
  }

  // eslint-disable-next-line no-underscore-dangle
  const storyStore = __STORYBOOK_CLIENT_API__._storyStore;

  // Storybook 5+ API
  if (storyStore.extract) {
    return Object.values(storyStore.extract()).map(specFromStory) as unknown as StorySpec[];
  }

  // Storybook 4- API
  return __STORYBOOK_CLIENT_API__
    .getStorybook()
    .map(({ kind, stories }: any) =>
      stories.map(({ name }: any) =>
        specFromStory({
          kind,
          name,
          parameters:
            storyStore.getStoryAndParameters &&
            storyStore.getStoryAndParameters(kind, name).parameters,
        })
      )
    )
    .reduce((a: any, b: any) => [...a, ...b], []); // flatten
};

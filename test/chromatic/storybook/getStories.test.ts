import getStories from '../../../src/chromatic/storybook/getStories';

jest.mock('../../../src/chromatic/tester/runtimes');
import getRuntimeSpecs from '../../../src/chromatic/tester/runtimes';
const mockGetRuntimeSpecs = (getRuntimeSpecs as any) as jest.Mock;
mockGetRuntimeSpecs.mockResolvedValue([
    {
        storyId: 'components-recommendations--default',
        name: 'default',
        component: {
            name: 'Components/Recommendations',
            displayName: 'Recommendations'
        },
        parameters: { docsOnly: undefined, fileName: '716', framework: 'react' }
    },
    {
        storyId: 'welcome--to-storybook',
        name: 'to Storybook',
        component: { name: 'Welcome', displayName: 'Welcome' },
        parameters: { docsOnly: undefined, fileName: '717', framework: 'react' }
    },
    {
        storyId: 'button--text',
        name: 'Text',
        component: { name: 'Button', displayName: 'Button' },
        parameters: { docsOnly: undefined, fileName: '724', framework: 'react' }
    },
    {
        storyId: 'button--emoji',
        name: 'Emoji',
        component: { name: 'Button', displayName: 'Button' },
        parameters: { docsOnly: undefined, fileName: '724', framework: 'react' }
    }
]);

describe('getStories', () => {
    it('returns a list of stories', async () => {
        const storySpecs = await getStories({
            isolatorUrl: 'https://test.com/iframe.html',
            verbose: false,
            allowConsoleErrors: false
        });
        expect(storySpecs).toHaveLength(4);
    });
});
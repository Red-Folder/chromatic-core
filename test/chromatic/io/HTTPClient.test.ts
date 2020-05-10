import HTTPClient from '../../../src/chromatic/io/HTTPClient';

jest.mock('node-fetch');
import fetch from 'node-fetch';
const {Response} = jest.requireActual('node-fetch');

const mockedFetch = ((fetch as any) as jest.Mock);

describe('HTTPClient', () => {
    it('returns response', async () => {
        mockedFetch.mockReturnValue(Promise.resolve(new Response(JSON.stringify({ value: 'tests' }))));

        const client = new HTTPClient();
        const response = await client.fetch("https://example");
        expect(response).not.toBeNull();
        expect(response.status).toBe(200);

        var data = await response.json();
        expect(data.value).toBe("tests");
    });
});
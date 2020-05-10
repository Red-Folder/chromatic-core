import getToken from '../../src/chromatic/getToken';

jest.mock('../../src/chromatic/io/GraphQLClient', () => () => ({
    runQuery: (_query: string, variables: any): Promise<any> => {
        return new Promise((resolve, _reject) => {
            var projectCode = variables['projectCode'];

            if (projectCode == 'VALID CODE') {
                return resolve({
                    createAppToken: 'VALID TOKEN'
                });
            }
            
            throw new Error();
        });
    }
}));

describe('getToken', () => {
    it('with a valid project code will retrieve the token', async () => {
        const token = await getToken('VALID CODE');
        expect(token).toEqual('VALID TOKEN');
    });

    it('with an invalid project code will throw error', async () => {
        const promise = getToken('INVALID CODE');
        await expect(promise).rejects.toThrowError();
    });
});
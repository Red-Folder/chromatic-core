import GraphQLClient from './io/GraphQLClient';
import dedent from 'ts-dedent';

const TesterCreateAppTokenMutation = `
  mutation TesterCreateAppTokenMutation($projectCode: String!) {
    createAppToken(code: $projectCode)
  }
`;

export interface CreateAppTokenData {
  createAppToken: string
}

const getToken = async (projectCode: string): Promise<string> => {
  const client = new GraphQLClient({
    retries: 3,
  });

  try {
    const data = await client.runQuery<CreateAppTokenData>(TesterCreateAppTokenMutation, {
      projectCode,
    });

    return data.createAppToken;

    // TODO - set the header elsewhere
    //client.headers = { ...client.headers, Authorization: `Bearer ${jwtToken}` };
  } catch (errors) {
    if (errors[0] && errors[0].message && errors[0].message.match('No app with code')) {
      throw new Error(dedent`
            Incorrect project-token '${projectCode}'.
          
            If you don't have a project yet login to https://www.chromatic.com and create a new project.
            Or find your code on the manage page of an existing project.
          `);
    }
    throw errors;
  }
}

export default getToken;
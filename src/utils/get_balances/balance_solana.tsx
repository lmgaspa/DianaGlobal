import axios from 'axios';

const API_URL = 'https://graphql.bitquery.io/';
const API_KEY = 'BQY8IM5ckSrmqZqC5mTwlYgKcMGNlCbn';

export const getSolanaBalance = async (solAddress: string): Promise<number | null> => {
  try {
    const response = await axios.post(
      API_URL,
      {
        query: `
          query ($network: SolanaNetwork!, $address: String!) {
            solana(network: $network) {
              address(address: {is: $address}) {
                balance
              }
            }
          }
        `,
        variables: { network: 'solana', address: solAddress },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
        },
      }
    );

    const data = response.data;
    if (data.errors) {
      console.error('Error in API response:', data.errors);
      return null;
    }

    if (!data.data || !data.data.solana || !data.data.solana.address.length) {
      console.error('No balance data available for Solana address:', solAddress);
      return null;
    }

    return data.data.solana.address[0].balance;
  } catch (error) {
    console.error('Error fetching Solana balance:', error);
    return null;
  }
};

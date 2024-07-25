import axios from 'axios';

const API_URL = 'https://graphql.bitquery.io/';
const API_KEY = 'BQY8IM5ckSrmqZqC5mTwlYgKcMGNlCbn';

export const getDogecoinBalance = async (dogeAddress: string): Promise<number | null> => {
  try {
    const query = `
      query ($network: String!, $address: String!) {
        bitcoin(network: $network) {
          addressStats(address: {is: $address}) {
            address {
              balance
            }
          }
        }
      }
    `;

    const variables = {
      network: 'dogecoin',
      address: dogeAddress,
    };

    const response = await axios.post(
      API_URL,
      { query, variables },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
        },
      }
    );

    const data = response.data;

    if (data.errors) {
      console.error(data.errors[0].message);
      return null;
    } else {
      const balanceInDogecoin = data.data.bitcoin.addressStats[0].address.balance / 100000000;
      return balanceInDogecoin;
    }
  } catch (error) {
    console.error('Error fetching Dogecoin balance:', error);
    return null;
  }
};

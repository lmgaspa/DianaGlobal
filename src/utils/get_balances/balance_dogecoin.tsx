import axios from 'axios';

const API_URL = 'https://graphql.bitquery.io/';
const API_KEY = 'BQY8IM5ckSrmqZqC5mTwlYgKcMGNlCbn';

export const getDogecoinBalance = async (dogeAddress: string): Promise<number | null> => {
  try {
    const query = `
      query ($network: BitcoinNetwork!, $address: String!) {
        dogecoin: bitcoin(network: $network) {
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
    } else if (!data.data.dogecoin.addressStats.length) {
      console.warn(`No addressStats found for the given address: ${dogeAddress}`);
      return 0; // Retorna 0 se não houver dados
    } else {
      const balanceInDogecoin = data.data.dogecoin.addressStats[0].address.balance;
      return balanceInDogecoin || 0; // Garante que o saldo seja 0 se não houver saldo
    }
  } catch (error) {
    console.error(`Error fetching Dogecoin balance for address ${dogeAddress}:`, error);
    return null;
  }
};

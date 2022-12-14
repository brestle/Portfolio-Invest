import axios from 'axios'

export const getPrice = (coin: string) => {
  let url = `https://rest.coinapi.io/v1/exchangerate/${coin}/USD`
  const headers = { 
    'X-CoinAPI-Key': '86454865-996F-4D79-A11A-18E5E3C34269', 
    "Accept-Encoding": "gzip,deflate,compress" 
  }
  return axios
    .get(url, { headers: headers })
    .then((res: any) => res.data.rate)
    .catch((err: any) => {
      // Handle error
      console.log(err);
    });
}

import cron from "node-cron";
import axios from "axios";

import { getBankNiftyOptionChainData } from "../database/bankNiftyOptionChain";
import { getBankNiftyFutureData } from "../database/bankNiftyFuture";
let cookie = `nsit=62b6eQKcFk9bUqykCYabIuvq; nseappid=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhcGkubnNlIiwiYXVkIjoiYXBpLm5zZSIsImlhdCI6MTYxMjQ5MjYxOSwiZXhwIjoxNjEyNDk2MjE5fQ.QEcJocMzIbXQxnhpmx0VzHr3_dp8_ognruUVfQ3EmpU; _ga=GA1.2.1063069182.1612492620; _gid=GA1.2.876682371.1612492620; _gat_UA-143761337-1=1; ak_bmsc=16C3F1C2934DC4FD919727ED9F98BFC1687C3654744700004BAF1C602AA6C214~plPHct/6fABaSLOCGBgf54+Mg7VML7UYAWHS3jA0aJ0MK9yjLvcIlwC7KWLTCsEyoCyT9pb8/8KKlLSZWkWrK4rSpWnZi30SUfI/cRnIFwAHsQ+MEwhu1NLiCO6Dbe/Zl/wZ0/wODUrYdL7XKRr0OwWv61yOn4oQx8bdUyv5B26BmLvz9nL+sGhR/PqORKKJnkmuBEXgIEbjwkRQJyG3OeR91zw8+03OY7MJBV6XgZz6ayjy0mWmuWovik3ggGMeXl; RT="z=1&dm=nseindia.com&si=7dcd2b73-7b82-4916-8793-2d7d4d44596c&ss=kkrogzfc&sl=1&tt=4zl&bcn=%2F%2F684fc538.akstat.io%2F&ld=4zz&nu=b5bab066f515f60e72d7925c57abf2df&cl=527"; bm_sv=B82888A07DC5BCF4DE465BB3CC6D64DA~VW856xbPA/P/TlfAr8/Ae9AwswuGM/OfCf1hUOK+Lf2efEwg5Z0g5RsaKz4pqQ7ZCrgpwCEppQ3aUcsho2ZeCnRfwLqqVq1Qz1biZHlJoaaK7ad0TPVhzS3Gna0GZA2QRg++GXKU6KsegPc9b0dmYxQURUoFKurH63NIpk5x+Q0=`;

const getCookie = async () => {
  console.log(
    "************ CRON JOB START FOR UPDATING COOKIE ***************"
  );
  try {
    const response = await axios.get(
      "https://www.nseindia.com/market-data/equity-derivatives-watch"
    );

    const headers = response.headers;
    cookie = headers["set-cookie"];
    cookie = `${cookie[0]};${cookie[1]};`;
    console.log(
      "************ CRON JOB END FOR UPDATING COOKIE ***************"
    );

    return cookie;
  } catch (error) {
    console.log("error getCookie() ====>", error);
    return error;
  }
};

const seedDataIntoDB = async () => {
  if (cookie === "") {
    console.log(
      `************ CRON FUNCTION CALLED for 1st time cookie === "" ***************`
    );

    getCookie();
  }
  await getBankNiftyOptionChainData();
  await getBankNiftyFutureData();
};

// cron.schedule("*/1 * * * *", getCookie);

export { cookie, getCookie, seedDataIntoDB };

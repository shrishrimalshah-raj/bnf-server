import cron from "node-cron";
import axios from "axios";

import { getBankNiftyOptionChainData } from "../database/bankNiftyOptionChain";
import { getBankNiftyFutureData } from "../database/bankNiftyFuture";
let cookie = `bm_sv=D88B5E78F7F0407BC83C11A785DC2A80~cGd5EJUxUX1L+t98TLJG2dwX2kThKT5bnG+lYN2pYoWj6MSKVprwdLy7mBvXq0ZYzUeShCbiAU8LUZmVt/kW4D+971jmh/L8EyrxQUwXYs7htnJe1jmdYuvovk26bA6vh+UImnvQomP4hMzzYF4fU1e6ctYtgcZEa4SjqDO4xVQ=; Domain=.nseindia.com;`;

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

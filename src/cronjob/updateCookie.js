import cron from "node-cron";
import axios from "axios";

import { getBankNiftyOptionChainData } from "../database/bankNiftyOptionChain";
import { getBankNiftyFutureData } from "../database/bankNiftyFuture";
let cookie = "";

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
    return cookie;
  } catch (error) {
    console.log('error getCookie() ====>', error)
    return error;
  }

  console.log("************ CRON JOB END FOR UPDATING COOKIE ***************");
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

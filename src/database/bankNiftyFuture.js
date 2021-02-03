import { config } from "../config";
import {
  InsertOneDocument,
  FineOneDocument,
  FindLastNDocument,
} from "./Repository";
const { collectionNameBankNiftyFuturesOI } = config;
import axios from "axios";
import { cookie } from "../cronjob/updateCookie";
import { getOpenInterestSignal } from "./helper";

const getBankNiftyFutureData = async (req, res) => {
  try {
    console.log(
      "************ getBankNiftyFutureData API Called ***************"
    );

    const headers = {
      headers: {
        accept: "*/*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        cookie: cookie,
        mode: "cors",
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64)",
        "content-encoding": "gzip",
        "content-type": "application/json",
      },
    };

    const { data } = await axios.get(
      "https://www.nseindia.com/api/liveEquity-derivatives?index=nifty_bank_fut",
      headers
    );

    const timestamp = data["timestamp"];
    const underlyingValue = data.data[0]["underlyingValue"];
    const openInterest = data.data.reduce((acc, curr) => {
      if (acc === 0) {
        return curr.openInterest;
      } else {
        return curr.openInterest + acc;
      }
    }, 0);

    const lastDocument = await FindLastNDocument(
      collectionNameBankNiftyFuturesOI,
      {},
      { createdAt: -1 },
      1
    );

    let openInterestData = {
      timestamp: new Date(timestamp),
      underlyingValue,
      openInterest,
      openInterestSignal: "",
      createdAt: new Date(),
    };

    const isDupicate = await FineOneDocument(collectionNameBankNiftyFuturesOI, {
      timestamp: new Date(timestamp),
    });

    if (!isDupicate) {
      if (lastDocument.length === 0) {
        await InsertOneDocument(
          collectionNameBankNiftyFuturesOI,
          openInterestData
        );
      } else {
        openInterestData = {
          ...openInterestData,
          openInterestSignal: getOpenInterestSignal(
            openInterestData,
            lastDocument[0]
          ),
        };
        await InsertOneDocument(
          collectionNameBankNiftyFuturesOI,
          openInterestData
        );
      }
    }
    return true;
  } catch (error) {
    console.log(
      `************ getBankNiftyFutureData API Error ${error} ***************`
    );
  }
};

export { getBankNiftyFutureData };

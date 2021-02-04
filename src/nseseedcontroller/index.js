import express from "express";

import { getCookie } from "../cronjob/updateCookie";
import { getBankNiftyFutureData } from "../database/bankNiftyFuture";
import { getBankNiftyOptionChainData } from "../database/bankNiftyOptionChain";
const router = express.Router();

router.get("/bankNiftyOptionChain", async (req, res) => {
  try {
    await getBankNiftyOptionChainData();
    res.json({ message: "!!! seeeded BNF options data !!!" });
  } catch (error) {
    console.log("Error =====> /bankNiftyOptionChain");
  }
});

router.get("/bankNiftyFuture", async (req, res) => {
  try {
    await getBankNiftyFutureData();
    res.json({ message: "!!! seeeded BNF futures data !!!" });
  } catch (error) {
    console.log("Error =====> /bankNiftyFuture");
  }
});

router.get("/updateCookie",  async (req, res) => {
    try {
      await getCookie();
      res.json({ message: "!!! updateCookie !!!" });
    } catch (error) {
      console.log("Error =====> /bankNiftyFuture");
    }
  });

export default router;

// SEED DATA API
// app.get("/bankNiftyOptionChain", async (req, res) => {
//   try {
//     await getBankNiftyOptionChainData();
//     res.json({ message: "!!! seeeded BNF options data !!!" });
//   } catch (error) {
//     console.log("Error =====> /bankNiftyOptionChain");
//   }
// });

// SEED DATA API
// app.get("/bankNiftyFuture", async (req, res) => {
//   try {
//     await getBankNiftyFutureData();
//     res.json({ message: "!!! seeeded BNF futures data !!!" });
//   } catch (error) {
//     console.log("Error =====> /bankNiftyFuture");
//   }
// });

// UPDATE TOKEN API
// app.get("/updateCookie", async (req, res) => {
//   try {
//     await getCookie();
//     res.json({ message: "!!! updateCookie !!!" });
//   } catch (error) {
//     console.log("Error =====> /bankNiftyFuture");
//   }
// });

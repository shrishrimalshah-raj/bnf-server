require("dotenv").config();
const envVars = process.env;

import http from "http";
import socketIo from "socket.io";
import express from "express";
const MongoClient = require("mongodb").MongoClient;
import cors from "cors";

import { config } from "./config";
import { FindLastNDocument } from "./database/Repository";
import cron from "node-cron";
import { seedDataIntoDB, getCookie } from "./cronjob/updateCookie";

import NseSeedController from "./nseseedcontroller";
// import { getBankNiftyOptionChainData } from "./database/bankNiftyOptionChain";
// import { getBankNiftyFutureData } from "./database/bankNiftyFuture";

const router = express.Router();

const {
  url,
  collectionNameBankNiftyOptionChainOI,
  collectionNameBankNiftyFuturesOI,
} = config;

const app = express();
app.use(cors()); // We're telling express to use CORS

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

//Hello WORLD
// app.get("/api", async (req, res) => {
//   try {
//     // const res = await getCookie();
//     getCookie()
//       .then((response) => {
//         res.json({ message: "!!! updateCookie !!!" });
//       })
//       .catch((error) => {
//         res.json({ message: "!!! Error In UpdateCookie !!!" });
//       });
//   } catch (error) {
//     res.json({ message: "!!! Error In UpdateCookie !!!" });
//   }
// });

app.use("/api", NseSeedController);

//Hello WORLD
app.get("/", (req, res) => {
  res.send("HELLO WORLD");
});

const getApiAndEmit = async (socket, date) => {
  const startOfDay = new Date(
    new Date(date).setUTCHours(0, 0, 0, 0)
  ).toISOString();
  const endOfDay = new Date(
    new Date(date).setUTCHours(23, 59, 59, 999)
  ).toISOString();

  try {
    const bankNiftyoptionChainData = await FindLastNDocument(
      collectionNameBankNiftyOptionChainOI,
      {
        createdAt: {
          $gte: new Date(startOfDay),
          $lt: new Date(endOfDay),
        },
      },
      { createdAt: 1 },
      200
    );

    const bankNiftyFutureData = await FindLastNDocument(
      collectionNameBankNiftyFuturesOI,
      {
        createdAt: {
          $gte: new Date(startOfDay),
          $lt: new Date(endOfDay),
        },
      },
      { createdAt: 1 },
      200
    );

    socket.emit("FromAPI", {
      bankNiftyoptionChainData,
      bankNiftyFutureData,
    });
  } catch (error) {
    console.error(`Error: ${error.code}`);
  }
};

let interval;
io.on("connection", (socket) => {
  console.log("New client connected");
  let date = socket.handshake.query["date"];
  if (interval) {
    clearInterval(interval);
  }

  interval = setInterval(() => getApiAndEmit(socket, date), 5000);

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(process.env.PORT || 8080, async () => {
  console.log(`Listening on port ${process.env.PORT || 8080}!`);

  try {
    let client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    global.client = client;

    const cleanup = (event) => {
      // SIGINT is sent for example when you Ctrl+C a running process from the command line.
      client.close(); // Close MongodDB Connection when Process ends
      process.exit(); // Exit with default success-code '0'.
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);

    console.log(`Database connection successfully ${url}`);
    // await getCookie();
    // await seedDataIntoDB()
    // cron.schedule("*/3 9-16 * * 1-5", seedDataIntoDB);
    // cron.schedule("*/20 9-16 * * 1-5", getCookie);

    // cron.schedule("*/1 * * * 1-5", seedDataIntoDB);
    // cron.schedule("*/2 22-23 * * 1-5", seedDataIntoDB);
    // cron.schedule("*/30 * * * 1-5", getCookie);
  } catch (error) {
    console.log(`Database connection failed`);
  }
});

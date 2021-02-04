require("dotenv").config();
const envVars = process.env;

import http from "http";
import socketIo from "socket.io";
import express from "express";
const MongoClient = require("mongodb").MongoClient;
import cors from "cors";

import { FindLastNDocument } from "./database/Repository";
import cron from "node-cron";
import { seedDataIntoDB, getCookie } from "./cronjob/updateCookie";

import NseSeedController from "./nseseedcontroller";
import { config } from "./config";
import axios from "axios";
const { dbName } = config;
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

const getTodos = async () => {
  const response = await axios.get(
    "https://jsonplaceholder.typicode.com/todos/1"
  );
  return response.data;
};

//Hello WORLD
app.get("/todo", async (req, res) => {
  try {
    const response = await getTodos();
    const res1 = await axios.get(
      "https://www.nseindia.com/market-data/equity-derivatives-watch"
    );

    const headers = res1.headers;
    let cookie = headers["set-cookie"];
    cookie = `${cookie[0]};${cookie[1]};`;

    res.json(cookie);
  } catch (e) {
    console.log(`todo Error =====> ${e}`);
  }
});

//Hello WORLD
app.get("/find", async (req, res) => {
  const FindAllDocument = async (collectionName, query = {}, column = {}) => {
    try {
      const collection = await global.client
        .db(dbName)
        .collection(collectionName);
      let res = await collection.find(query).toArray();

      return res;
    } catch (e) {
      console.log(`FindAllDocument Error =====> ${e}`);
    }
  };

  const response = await FindAllDocument(collectionNameBankNiftyOptionChainOI);
  res.json(response);
});

app.use("/nse", NseSeedController);

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

const url1 = "https://www.nseindia.com/market-data/equity-derivatives-watch";
const makeRequest = async (url) => {
  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      // response - object, eg { status: 200, message: 'OK' }
      console.log("success stuff");
      console.log(response);
      return response;
    }
    return false;
  } catch (err) {
    console.error(err);
    return false;
  }
};

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
    // await getTodos();
    // await getCookie();
    await makeRequest(url1);

    // (async () => {
    //   const res = await makeRequest(url)
    //   console.log(res)
    // })()

    // const headers = {
    //   headers: {
    //     accept: "*/*",
    //     "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    //     "sec-fetch-dest": "empty",
    //     "sec-fetch-mode": "cors",
    //     "sec-fetch-site": "same-origin",
    //     cookie:
    //       '_ga=GA1.2.2006193904.1593869534; _gid=GA1.2.1724336317.1601487080; bm_mi=A4238A608B7BEBA8C6F4D533B318AB50~bG/mJ1FUuif0RV4orQ51MPfNSV7lx4gUtQ1/PgYUWVKhSUK02rxxf0MImxrEh3Hm1a3QC/6vHiBve0LKiFUPA9MSDcN9nKddalQQmS+9Eiy4hr9HE8hMbth6aKaYQmd8imy0L7QyPExb+wHQ44DkNWHbvdhGDpeppop+6dWM8eTqSoUlfRyd3RvwGm3N7pqWV7LwxpvgWCFKJnxySQ4F21lEF6x+Hc/s/Ubmn/OT4El1SyvFG+P3wyKUMAd9dZ1/5QJvWwR52VCLTIr7jhx/tDDsGGoeNK/I3ojBs5nZ1L7sXZmyrMsfuNhHoli4IopkNMB86N2T60nmcdR3e2gxdg==; ak_bmsc=0A65E9193900E075D43299338D4C1DA2173F6D048B650000CB69755F25259938~pl7GDkNDEPEQGdTKb1PphdIx0Ndjc3YAZtxuunplf53TRptnijN8BR4jJOQvMGle6+8MiwVg6OkTLgP0dCqrSNToNU48+fGkRi5PF9isU4HDhuIeAhVpDXpEwpi+c745XjvELQKouRMKbVx86F3lcclubXf8X+spk3frfjj4XVQebbahs6mGVVcKS/O1W7FqQxzM/BGkDqGI2Ola2o9FuMObEY3l7Oi/M1hmH6VTjrNnJxm/A3gnzx1z+IomuOXC4u; nsit=4_lPgBG3ATtfhL-SXCoc-7O6; _gat_UA-143761337-1=1; nseappid=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhcGkubnNlIiwiYXVkIjoiYXBpLm5zZSIsImlhdCI6MTYwMTUzMDk3NCwiZXhwIjoxNjAxNTM0NTc0fQ.5IXGHjFifMkzOdc_YpTvIGX1-rgcL-xwyW6j4A5z-28; RT="z=1&dm=nseindia.com&si=b7c537c1-8452-4681-84ff-78ff633828f3&ss=kfqd8zkd&sl=2&tt=4cf&bcn=%2F%2F684d0d38.akstat.io%2F"; bm_sv=F987B3E5F59D55C8681BC7B4D65F9D33~ZP9XtgWqTIZ25LE7MTOHcMrsr2+lnWwgUrbMMHD9BAwN/854O/UIwBEfADbLCiQRJ6d7S6zPX5EeH28d2lFxpG9BbQ9ywXfB8LeG7pnMgwwZeai5eexh/dnHQOQeNMnescQ8Yg5A9E3JlSvnNQGF9K3GNPBKj7TJAniSgn5cNaw=',
    //     mode: "cors",
    //     "user-agent": "Mozilla/5.0 (X11; Linux x86_64)",
    //     "content-encoding": "gzip",
    //     "content-type": "application/json",
    //   },
    // };

    // // https://www.nseindia.com
    // axios
    //   .get(
    //     "https://www.nseindia.com/market-data/equity-derivatives-watch",
    //     headers
    //   )
    //   .then((res) => console.log("res", res))
    //   .catch((err) => console.error(err)); // promise
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

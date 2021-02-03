require("dotenv").config();
const envVars = process.env;

const config = {
  url: envVars.MONGODB_URL,
  dbName: envVars.dbName,
  collectionNameBankNiftyOptionChainOI:  envVars.collectionNameBankNiftyOptionChainOI,
  collectionNameBankNiftyFuturesOI: envVars.collectionNameBankNiftyFuturesOI,
};

export { config };

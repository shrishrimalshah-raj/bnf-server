import { config } from "../config";
const { dbName } = config;

const InsertOneDocument = async (collectionName, data) => {
  try {
    const collection = await global.client
      .db(dbName)
      .collection(collectionName);
    let res = await collection.insertOne(data);
    return res;
  } catch (e) {
    console.log(`InsertOneDocument Error =====> ${e}`);
  }
};

const FineOneDocument = async (collectionName, query = {}) => {
  try {
    const collection = await global.client
      .db(dbName)
      .collection(collectionName);
    let res = await collection.findOne(query);
    return res;
  } catch (e) {
    console.log(`FineOneDocument Error =====> ${e}`);
  }
};

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

const FindLastNDocument = async (
  collectionName,
  query = {},
  column = {},
  limit = 1
) => {
  try {
    const collection = await global.client
      .db(dbName)
      .collection(collectionName);
    let res = await collection.find(query).sort(column).limit(limit).toArray();
    return res;
  } catch (e) {
    console.log(`FindLastNDocument Error =====> ${e}`);
  }
};

// db.getCollection('banknifty-option-chain-oi').find({}).sort({ createdAt: -1}).limit(1);
// const FindLastNDocument =

export {
  InsertOneDocument,
  FineOneDocument,
  FindAllDocument,
  FindLastNDocument,
};

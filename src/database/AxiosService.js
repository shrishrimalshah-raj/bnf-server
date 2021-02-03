import axios from "axios";
import { cookie } from "../cronjob/updateCookie";

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

const AxiosService = {
  get(url) {
    return axios.get(url, headers);
  },
};

export default AxiosService;

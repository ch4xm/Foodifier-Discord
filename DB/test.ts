import { CookieDB } from 'cookie-driver';

import dotenv from 'dotenv';

dotenv.config()

const cookieDB = new CookieDB("https://cookiedb.com/api/db",process.env.cookiedb_token as string)

async function test(){

  let a = await cookieDB.select("reviews", "eq($username, 'nmarks#6958')");
  console.log(a);

}


test();

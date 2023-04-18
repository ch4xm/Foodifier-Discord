import { CookieDB } from 'cookie-driver';

import dotenv from 'dotenv';

dotenv.config()

let token: string = process.env.cookiedb_token!;

const cookieDB = new CookieDB(
  "https://cookiedb.com/api/db",
  token
)


async function createTable() {


await cookieDB.createTable("reviews", {
  username : "string",
  id : "string",
  rating : "number",
  review : "string",
  food_item : "string",
  upvotes : "number",
  downvotes : "number"
});


// await cookieDB.insert("reviews", {
//   username: "nmarks#6958",
//   id : "184004745416015872",
//   rating: 9,
//   review: "A little overcooked",
//   food_item: "Allergen Free Hallal Chicken Thighs",
//   upvotes : 100000,
//   downvotes : 0,
// });

}

createTable();



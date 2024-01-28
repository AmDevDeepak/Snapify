const mongoose = require('mongoose');
const initData = require('./data');
const Post = require('../models/post');

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/MYSOCIALAPP");
}

main()
  .then(() => {
    console.log("Connected To DataBase.");
})
  .catch((err) => {
    console.log(err);
  });

const initDB = async () => {
  await Post.deleteMany({});
  initData.data = initData.data.map((obj) => ({ ...obj, owner: "65ad286a28d49b0b2a276eb8" }));
    await Post.insertMany(initData.data);
    console.log('Data initialised');
};

initDB();

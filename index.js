require("dotenv").config(); // load environment variables

const app = require("./src/app"); // import express app

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`CA2 App listening on port ${PORT}`);
});
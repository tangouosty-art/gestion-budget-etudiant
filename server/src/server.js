const app = require("./app");
const env = require("./config/env");
const pool = require("./config/db");

async function startServer() {
  try {
    const connection = await pool.getConnection();
    connection.release();

    app.listen(env.PORT, () => {
      console.log(`Server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("Impossible de se connecter à MySQL :", error.message);
    process.exit(1);
  }
}

startServer();
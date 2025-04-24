import app from "./app";

async function start() {
  try {
    await app.listen({ port: 3333, host: '0.0.0.0' });
    console.log("🚀 Server listening on http://localhost:3333");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();

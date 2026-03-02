import app from "./app";

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is flying at http://localhost:${PORT}`);
  console.log(`📚 Try visiting http://localhost:${PORT}/api/books`);
});

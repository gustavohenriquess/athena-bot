import { app } from "@infra/http/app";

const port = process.env.port || 3000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

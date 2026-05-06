import Koa from "koa";

const app = new Koa();
const port = Number(process.env.PORT ?? 3000);

app.use(async (context) => {
  context.body = {
    service: "a2ui-playground-server",
    status: "initialized",
  };
});

app.listen(port, () => {
  console.log(`a2ui-playground-server listening on port ${port}`);
});

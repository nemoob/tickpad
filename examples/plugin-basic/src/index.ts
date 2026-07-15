import type { TickpadPlugin } from "@tickpad/plugin-api";

export default {
  manifest: {
    id: "hello-tickpad",
    name: "Hello Tickpad",
    version: "0.1.0",
    apiVersion: "0.1",
    permissions: ["document:read"]
  },
  activate(ctx) {
    ctx.commands.register({
      id: "hello-tickpad.sayHello",
      title: "Say hello",
      run: () => {
        console.log(`Current document has ${ctx.document.getStats().words} words`);
      }
    });
  }
} satisfies TickpadPlugin;

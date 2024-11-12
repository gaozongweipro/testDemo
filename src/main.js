import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import FindUI from "@gaozongweipro/find-ui";
import ElementPlus from "element-plus";

// createApp(App).mount("#app");

const app = createApp(App);

app.use(ElementPlus);

app.use(FindUI);

app.mount("#app");

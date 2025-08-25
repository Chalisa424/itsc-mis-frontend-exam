import { createApp } from "vue";
import { createPinia } from "pinia";
import "./assets/main.css";
import router from "./router";
import App from "./App.vue";

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(createPinia)

createApp(App).mount("#app");

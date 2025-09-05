import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import dayjs from "dayjs";
import 'dayjs/locale/th'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import "./assets/main.css";

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(createPinia)
dayjs.extend(localizedFormat)
dayjs.locale('th')
createApp(App).use(router).mount("#app");

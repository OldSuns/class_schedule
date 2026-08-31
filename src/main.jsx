import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App.jsx";
import {
  migrateSummerScheduleStorage
} from "./services/app/summerScheduleMigration.js";
import "./index.css";

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

const startApp = async () => {
  await migrateSummerScheduleStorage();
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

void startApp().catch((error) => {
  console.error("夏季课表数据迁移失败:", error);
  rootElement.textContent = "更新数据失败，请重新打开应用";
});


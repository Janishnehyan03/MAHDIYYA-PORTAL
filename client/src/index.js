import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { UserAuthProvider } from "./context/userContext";
import "./index.css";
import { ExamProvider } from "./context/examContext";
import { ClassProvider } from "./context/classContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <UserAuthProvider>
        <ExamProvider>
          <ClassProvider>
            <App />
          </ClassProvider>
        </ExamProvider>
      </UserAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

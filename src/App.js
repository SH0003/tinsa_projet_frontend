import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import CustomLayout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Temoins from "./pages/Temoins";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/*"
          element={
            <PrivateRoute>
              <CustomLayout>
                <Routes>
                  <Route path="/Temoins" element={<Temoins />} />
                </Routes>
              </CustomLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;

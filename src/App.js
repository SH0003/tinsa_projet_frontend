import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import CustomLayout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import Login from "./pages/Login";
import Temoins from "./pages/Temoins";
import Dossiers from "./pages/Dossiers";

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
                  <Route 
                    path="/Dossiers" 
                    element={
                      <RoleProtectedRoute allowedRoles={['developpement']}>
                        <Dossiers />
                      </RoleProtectedRoute>
                    } 
                  />
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

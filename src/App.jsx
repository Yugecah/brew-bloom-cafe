import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./Components/Navbar.jsx";
import Footer from "./Components/Footer.jsx";
import Home from "./Pages/Home.jsx";
import EmployeeLogin from "./Pages/EmployeeLogin.jsx";
import EmployeeDashboard from "./Pages/EmployeeDashboard.jsx";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>

          {/* CUSTOMER WEBSITE */}
          <Route
            path="/"
            element={
              <>
                <Navbar />

                <main>
                  <Home />
                </main>

                <Footer />
              </>
            }
          />

          {/* EMPLOYEE LOGIN */}
          <Route
            path="/employee/login"
            element={<EmployeeLogin />}
          />

          {/* EMPLOYEE DASHBOARD */}
          <Route
            path="/employee"
            element={<EmployeeDashboard />}
          />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AdminRoutes, DefaultRoutes } from "./Components/webRoutes/webroutes";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {DefaultRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
        {AdminRoutes.map(({ path, element, children }) => (
          <Route key={path} path={path} element={element}>
            {children.map(({ path: childPath, element: childElement }) => (
              <Route key={childPath} path={childPath} element={childElement} />
            ))}
          </Route>
        ))}
      </Routes>
    </BrowserRouter>
  );
}
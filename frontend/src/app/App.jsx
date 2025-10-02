import { useRoutes } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
// ROOT THEME PROVIDER
import { MatxTheme } from "./components";
// ALL CONTEXTS
import SettingsProvider from "./contexts/SettingsContext";
import {AxiosProvider} from "./contexts/AxiosContext";
import { AuthProvider } from "./contexts/JWTAuthContext.jsx";
// ROUTES
import routes from "./routes";
// FAKE SERVER
import "../__api__";
import {AlertProvider} from "./contexts/AlertContext.jsx";

export default function App() {
  const content = useRoutes(routes);

  return (
    <SettingsProvider>
        <AxiosProvider>
          <AuthProvider>
              <AlertProvider>
                  <MatxTheme>
                      <CssBaseline />
                      {content}
                  </MatxTheme>
              </AlertProvider>
          </AuthProvider>
        </AxiosProvider>
    </SettingsProvider>
  );
}

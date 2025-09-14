import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { store } from "./Redux/store.jsx";
import { Provider } from "react-redux";
import { UserProvider } from "./Context/UserProvider.jsx";
createRoot(document.getElementById("root")).render(
	<Provider store={store}>
		<StrictMode>
			<UserProvider>
				<App />
			</UserProvider>
		</StrictMode>
	</Provider>
);

import { Fragment, useContext } from "react";
import "./App.css";
import ClientRoute from "./Routes/ClientRoute";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Sidebar from "./components/Sidebar/Sibebar";
import { Oval } from "react-loader-spinner";
import { UserContext } from "./Context/UserProvider";

import { BrowserRouter as Router } from "react-router-dom";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
	const { user } = useContext(UserContext);
	return (
		<Fragment>
			<Router>
				{user && user.isLoading ? (
					<div className="loading-container">
						<Oval
							visible={true}
							height="80"
							width="80"
							color="#4fa94d"
							ariaLabel="oval-loading"
							wrapperStyle={{}}
							wrapperClass=""
						/>
						<div>Loading Data....</div>
					</div>
				) : (
					<div className="app-layout">
						{user && user.isAuthenticated && <Sidebar />}
						<div className="main-content">
							{user && user.isAuthenticated && <Navbar title="Bird Social" />}
							<div className="content-area">
								<ClientRoute />
							</div>
							{/* <Footer /> */}
						</div>
					</div>
				)}
			</Router>
			<ToastContainer
				position="top-right"
				autoClose={5000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick={false}
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="light"
				transition={Bounce}
			/>
		</Fragment>
	);
}

export default App;

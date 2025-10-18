import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
// import LoginForm from "../pages/Login/LoginForm";
// import AdminDashboard from "../pages/Admin/AdminDashboard";
import HomePage from "../pages/Home/HomePage";
import Profile from "../pages/Profile/Profile";
import ChatPage from "../pages/ChatPage/ChatPage";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Admin from "../pages/Admin/Admin";
// import PrivateRoutesRole from "./PrivateRoutesRole";
// import PrivateRoutes from "./PrivateRoutes";
// import LoginAdmin from "../pages/Login/LoginAdmin";
// import OrderMenu from "../pages/OrderMenu/OrderMenu";
// import ResetPassword from "../pages/Login/ResetPassword";

const ClientRoute = () => {
	return (
		<div>
			<Switch>
				{/* <Route path="/login" component={LoginForm} />
				<Route path="/reset-password" component={ResetPassword} />
				<Route path="/login_admin" component={LoginAdmin} /> */}
				{/* <PrivateRoutesRole
					path="/receptionist"
					component={ReceptionistDashboard}
					role="receptionist"
				/>
				<PrivateRoutesRole path="/waiter" component={Waiter} role="waiter" />
				<PrivateRoutesRole path="/chef" component={Chef} role="chef" /> */}
				{/* <PrivateRoutesRole
					path="/order-menu"
					component={OrderMenu}
					role="waiter"
				/>
				<PrivateRoutesRole
					path="/admin"
					component={AdminDashboard}
					role="admin"
				/> */}
				<Route path="/" exact>
					<HomePage />
				</Route>
				<Route path="/profile" component={Profile} />
				<Route path="/messenger" component={ChatPage} />
				<Route path="/login" component={Login} />
				<Route path="/register" component={Register} />
				<Route path="/admin" component={Admin} />
				<Route path="*">404 Not Found</Route>
				
			</Switch>
		</div>
	);
};

export default ClientRoute;

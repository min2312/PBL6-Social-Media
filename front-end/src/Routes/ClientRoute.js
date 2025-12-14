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
import Settings from "../pages/Settings/Settings";
import SearchResult from "../pages/SearchResult/SearchResult";
import FriendList from "../pages/FriendList/FriendList";
import PostById from "../pages/PostById/PostById";
import LoginAdmin from "../pages/Admin/Login/LoginAdmin";

// import PrivateRoutesRole from "./PrivateRoutesRole";
import PrivateRoutes from "./PrivateRoutes";
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
				<PrivateRoutes path="/profile/:id" component={Profile} />
				<PrivateRoutes path="/messenger" component={ChatPage} />
				<Route path="/login" component={Login} />
				<Route path="/register" component={Register} />
				<Route path="/login_admin" component={LoginAdmin} />
				<PrivateRoutes path="/friends" component={FriendList} />
				<Route path="/admin" component={Admin} />
				<PrivateRoutes path="/settings" component={Settings} />
				<PrivateRoutes path="/search" component={SearchResult} />
				<PrivateRoutes path="/post/:postId" component={PostById} />
				<Route path="*">404 Not Found</Route>
			</Switch>
		</div>
	);
};

export default ClientRoute;

import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Context/UserProvider";
import { createZaloPayOrder } from "../../services/paymentService";
import api from "../../setup/axios";
import { checkZaloPayOrderStatus } from "../../services/paymentService";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Crown, TrendingUp, Upload, Image, Video } from "lucide-react";
import "./Payment.css";

const Payment = () => {
	const { user } = useContext(UserContext);
	const [type, setType] = useState("premium");
	const [selectedPlan, setSelectedPlan] = useState(null);
	const [amount, setAmount] = useState(50000);
	const [content, setContent] = useState("");
	const [images, setImages] = useState([]);
	const [video, setVideo] = useState(null);
	const [loading, setLoading] = useState(false);
	const location = useLocation();
	// Pricing plans
	const premiumPlans = [
		{ id: "1month", duration: "1 Month", price: 50000, days: 30 },
		{ id: "1year", duration: "1 Year", price: 500000, days: 365 },
		{ id: "lifetime", duration: "Lifetime", price: 2000000, days: 36500 },
	];

	const sponsoredPlans = [
		{ id: "1week", duration: "1 Week", price: 100000, days: 7 },
		{ id: "1month", duration: "1 Month", price: 300000, days: 30 },
		{ id: "1year", duration: "1 Year", price: 2000000, days: 365 },
	];

	// On redirect from ZaloPay with app_trans_id, verify and show result
	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const appTransId = params.get("app_trans_id") || params.get("apptransid");
		const statusParam = params.get("status");
		if (appTransId) {
			(async () => {
				try {
					const res = await checkZaloPayOrderStatus({
						app_trans_id: appTransId,
					});
					if (res?.return_code === 1 || statusParam === "1") {
						toast.success(
							"Payment successful! Your account has been updated.",
							{ autoClose: 5000 }
						);

						// If new token returned (premium purchase), update user context
						if (res.token && res.user) {
							// Update user context with new premium status
							if (user && user.loginContext) {
								user.loginContext(res.user);
							}
						}

						// Clear URL params and redirect to home after short delay
						setTimeout(() => {
							window.history.replaceState({}, document.title, "/");
							window.location.href = "/";
						}, 2000);
					} else {
						toast.error("Payment not completed. Please try again.");
					}
				} catch (e) {
					toast.error("Unable to verify payment status.");
				}
			})();
		}
	}, [location.search]);

	const handlePay = async () => {
		if (!user?.isAuthenticated) {
			toast.error("Please login to continue.");
			return;
		}

		if (!selectedPlan) {
			toast.warning("Please select a plan.");
			return;
		}

		setLoading(true);
		try {
			let sponsoredPostId;
			if (type === "sponsored_post") {
				// 1) Create post first
				const formData = new FormData();
				formData.append("userId", user.account.id);
				formData.append("content", content || "");
				// append images (multiple)
				images.forEach((file) => formData.append("image", file));
				// append video (single)
				if (video) formData.append("video", video);

				const postRes = await api.post("/api/create-new-post", formData, {
					headers: { "Content-Type": "multipart/form-data" },
				});

				if (postRes && postRes.errCode === 0 && postRes.post?.id) {
					sponsoredPostId = postRes.post.id;
				} else {
					toast.error(
						postRes?.errMessage || "Failed to create sponsored post."
					);
					setLoading(false);
					return;
				}
			}

			// 2) Create payment order (premium or sponsored_post)
			const res = await createZaloPayOrder({
				userId: user.account.id,
				type,
				postId: sponsoredPostId,
				amount: selectedPlan.price,
				duration: selectedPlan.days,
			});

			if (res && res.errCode === 1) {
				// Error from backend (e.g., already have active premium)
				toast.error(res.errMessage || "Payment creation failed.");
				setLoading(false);
				return;
			}

			if (res && (res.order_url || res.payment_url)) {
				toast.info("Redirecting to ZaloPay payment...");
				window.location.href = res.order_url || res.payment_url;
			} else if (res && res.zp_trans_token) {
				toast.info("Order created. Open ZaloPay app to complete.");
			} else {
				toast.warning("Order created, but no payment URL returned.");
			}
		} catch (e) {
			toast.error("Failed to create payment order. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="payment-container">
			<div className="payment-header">
				<h2>Payment</h2>
				<p>Choose your plan and boost your experience</p>
			</div>

			<div className="payment-type-selector">
				<div
					className={`payment-type-card ${type === "premium" ? "active" : ""}`}
					onClick={() => {
						setType("premium");
						setSelectedPlan(null);
					}}
				>
					<div className="payment-type-icon">
						<Crown size={32} />
					</div>
					<div className="payment-type-title">Premium</div>
					<div className="payment-type-price">Unlock exclusive features</div>
				</div>

				<div
					className={`payment-type-card ${
						type === "sponsored_post" ? "active" : ""
					}`}
					onClick={() => {
						setType("sponsored_post");
						setSelectedPlan(null);
					}}
				>
					<div className="payment-type-icon">
						<TrendingUp size={32} />
					</div>
					<div className="payment-type-title">Sponsored Post</div>
					<div className="payment-type-price">Promote your content</div>
				</div>
			</div>

			<div className="payment-form">
				<div className="form-group">
					<label>
						{type === "premium"
							? "Choose Premium Plan"
							: "Choose Sponsored Duration"}
					</label>
					<div className="pricing-options">
						{(type === "premium" ? premiumPlans : sponsoredPlans).map(
							(plan) => (
								<div
									key={plan.id}
									className={`pricing-option ${
										selectedPlan?.id === plan.id ? "selected" : ""
									}`}
									onClick={() => setSelectedPlan(plan)}
								>
									<div className="pricing-option-duration">{plan.duration}</div>
									<div className="pricing-option-price">
										{plan.price.toLocaleString()} VND
									</div>
								</div>
							)
						)}
					</div>
				</div>

				{type === "sponsored_post" && (
					<>
						<div className="form-group">
							<label>Post Content</label>
							<textarea
								value={content}
								onChange={(e) => setContent(e.target.value)}
								placeholder="Write your sponsored content here..."
							/>
						</div>

						<div className="form-group">
							<label>
								<Image
									size={16}
									style={{ display: "inline", marginRight: 8 }}
								/>
								Images (Multiple allowed)
							</label>
							<div className="file-upload-wrapper">
								<label className="file-upload-label">
									<Upload size={20} style={{ marginRight: 8 }} />
									Click to upload images
									<input
										type="file"
										accept="image/*"
										multiple
										onChange={(e) =>
											setImages(Array.from(e.target.files || []))
										}
										className="file-upload-input"
									/>
								</label>
								{images.length > 0 && (
									<div className="file-info">
										{images.length} image(s) selected
									</div>
								)}
							</div>
						</div>

						<div className="form-group">
							<label>
								<Video
									size={16}
									style={{ display: "inline", marginRight: 8 }}
								/>
								Video (Max 1)
							</label>
							<div className="file-upload-wrapper">
								<label className="file-upload-label">
									<Upload size={20} style={{ marginRight: 8 }} />
									Click to upload video
									<input
										type="file"
										accept="video/*"
										onChange={(e) =>
											setVideo((e.target.files && e.target.files[0]) || null)
										}
										className="file-upload-input"
									/>
								</label>
								{video && <div className="file-info">{video.name}</div>}
							</div>
						</div>
					</>
				)}

				<button
					onClick={handlePay}
					disabled={loading || !selectedPlan}
					className="payment-button"
				>
					{loading ? "Processing..." : "Pay with ZaloPay"}
				</button>
			</div>
		</div>
	);
};

export default Payment;

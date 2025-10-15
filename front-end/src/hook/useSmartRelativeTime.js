import { useEffect, useState } from "react";

/**
 * Hook thông minh kiểu Facebook – chỉ cập nhật khi cần thiết
 * @param {string|Date} date - thời gian gốc (createdAt)
 * @param {function} formatFn - hàm formatTimeAgo (truyền từ Home)
 */
export default function useSmartRelativeTime(date, formatFn) {
	const [display, setDisplay] = useState(() => formatFn(date));

	useEffect(() => {
		function update() {
			setDisplay(formatFn(date));
		}

		// khoảng thời gian cần cập nhật lại
		let interval = null;
		const diff = Date.now() - new Date(date).getTime();

		if (diff < 60 * 1000) interval = 1000; // <1 phút → cập nhật mỗi giây
		else if (diff < 60 * 60 * 1000) interval = 60 * 1000; // <1h → mỗi phút
		else if (diff < 24 * 60 * 60 * 1000)
			interval = 60 * 60 * 1000; // <1 ngày → mỗi giờ
		else interval = null; // >1 ngày → không cần cập nhật

		if (interval) {
			const id = setInterval(update, interval);
			return () => clearInterval(id);
		}
	}, [date, formatFn]);

	return display;
}

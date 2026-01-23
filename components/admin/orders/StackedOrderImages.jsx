"use client";
import React from "react";

const StackedOrderImages = ({ items }) => {
	const maxVisible = 3;
	const visibleItems = items.slice(0, maxVisible);
	const remainingCount = Math.max(0, items.length - maxVisible);

	return (
		<div className="flex -space-x-2">
			{visibleItems.map((item, index) => (
				<div
					key={item.id || index}
					className={`relative w-[30px] h-[30px] rounded-full border-2 border-white bg-gray-100 overflow-hidden z-[${
						4 - index
					}]`}
					style={{ zIndex: 4 - index }} // Fallback for z-index
				>
					<img
						src={item.productImage}
						alt={item.productName || `Item ${index + 1}`}
						className="w-full h-full object-cover"
					/>
				</div>
			))}

			{remainingCount > 0 && (
				<div className="relative w-[30px] h-[30px] rounded-full border-2 border-white bg-gray-200 flex items-center justify-center z-[1]">
					<span className="text-xs font-medium text-gray-600">
						+{remainingCount}
					</span>
				</div>
			)}
		</div>
	);
};

export default StackedOrderImages;

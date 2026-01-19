import React from "react";

export default function Spinner({ bg }) {
	return (
		<div className={`dot-spinner`}>
			<div className={`dot-spinner__dot ${bg ? bg : ""}`}></div>
			<div className={`dot-spinner__dot ${bg ? bg : ""}`}></div>
			<div className={`dot-spinner__dot ${bg ? bg : ""}`}></div>
			<div className={`dot-spinner__dot ${bg ? bg : ""}`}></div>
			<div className={`dot-spinner__dot ${bg ? bg : ""}`}></div>
			<div className={`dot-spinner__dot ${bg ? bg : ""}`}></div>
			<div className={`dot-spinner__dot ${bg ? bg : ""}`}></div>
			<div className={`dot-spinner__dot ${bg ? bg : ""}`}></div>
		</div>
	);
}

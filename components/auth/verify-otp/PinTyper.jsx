import { useRef, useState, useEffect } from "react";

const OtpPinTyper = ({ length = 6, onComplete }) => {
	const [values, setValues] = useState(Array(length).fill(""));
	const inputRefs = useRef([]);

	useEffect(() => {
		const code = values.join("");
		if (code.length === length && values.every((v) => v !== "")) {
			onComplete(code);
		}
	}, [values]);

	const handleChange = (value, index) => {
		if (!/^\d*$/.test(value)) return;

		const next = [...values];
		next[index] = value.slice(-1);
		setValues(next);

		if (value && index < length - 1) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (e, index) => {
		if (e.key === "Backspace" && !values[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handlePaste = (e) => {
		const paste = e.clipboardData.getData("text").trim();
		if (!/^\d+$/.test(paste)) return;

		const next = paste.slice(0, length).split("");
		setValues(next);

		const focusIndex =
			next.findIndex((v) => v === "") === -1
				? length - 1
				: next.findIndex((v) => v === "");

		inputRefs.current[focusIndex]?.focus();
		e.preventDefault();
	};

	return (
		<div className="otp-inputs">
			{Array.from({ length }).map((_, index) => (
				<input
					key={index}
					type="text"
					maxLength={1}
					inputMode="numeric"
					pattern="[0-9]"
					value={values[index]}
					onChange={(e) => handleChange(e.target.value, index)}
					onKeyDown={(e) => handleKeyDown(e, index)}
					onPaste={handlePaste}
					ref={(el) => (inputRefs.current[index] = el)}
					placeholder="*"
					className={"code-digit"}
				/>
			))}
		</div>
	);
};

export default OtpPinTyper;

"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OtpPinTyper from "./PinTyper";
import { Formik, Form, ErrorMessage } from "formik";
import useAlert from "../../shared/hooks/useAlert";

export default function VerifyOtp() {
	const searchparams = useSearchParams();
	const email = searchparams.get("email");
	const nextUrl = searchparams.get("next");
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const { showAndHideAlert } = useAlert();
	const [submitting, setSubmitting] = useState(false);
	const router = useRouter();

	const resend = async (values) => {
		try {
			setSubmitting(true);
			const request = await fetch(`/api/auth/resend-otp`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			});

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error);
			}

			showAndHideAlert("success", "OTP code sent.");
			setSubmitting(false);
		} catch (error) {
			setSubmitting(false);
			showAndHideAlert("error", error.message);
			console.log(error);
		}
	};

	return (
		<div className="container verify-code-container">
			<div className="verify-code-header !flex items-center !flex-col">
				<img src="/logo.png" alt="Rich Cafe Logo" className="logo" />
				<h1>Verify Your Email</h1>
				<p className="tagline">
					Please enter the 6-digit code sent to{" "}
					<span id="displayPhoneNumber" className="highlight-text">
						your email - {email}
					</span>
					.
				</p>
			</div>
			<Formik
				initialValues={{ email: email, code: "" }}
				onSubmit={async (values) => {
					try {
						setErrorMessage("");
						const request = await fetch(`/api/auth/verify-otp`, {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify(values),
						});

						const response = await request.json();

						if (!request.ok) {
							throw new Error(response.error);
						}

						setSuccessMessage("You account has been verified.");

						setTimeout(() => {
							router.replace(nextUrl ?? "/");
						}, 1000);
					} catch (error) {
						setErrorMessage(error.message);
						console.log(error);
					}
				}}>
				{({ isSubmitting, setFieldValue, handleSubmit, values }) => (
					<Form id="verifyCodeForm" className="">
						<OtpPinTyper
							onComplete={(val) => {
								setFieldValue("code", val);
								setTimeout(() => {
									handleSubmit();
								}, 200);
							}}
						/>
						{errorMessage && (
							<p
								id="registrationStatus"
								className="status-message !text-red-500">
								{errorMessage}
							</p>
						)}
						{successMessage && (
							<p
								id="registrationStatus"
								className="status-message !text-green-500">
								{successMessage}
							</p>
						)}
						<button
							disabled={isSubmitting || values.code.length < 6}
							type="submit"
							className="button primary-button disabled:opacity-40">
							Verify Code
						</button>
						<p className="resend-text">
							Didn't receive a code?{" "}
							<span
								onClick={resend}
								id="resendCodeLink"
								className="action-link cursor-pointer">
								{submitting ? "Resending..." : "Resend Code"}
							</span>
						</p>
					</Form>
				)}
			</Formik>
		</div>
	);
}

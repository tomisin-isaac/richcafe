"use client";
import Image from "next/image";
import { Formik, Form, ErrorMessage, Field } from "formik";
import { signupSchema } from "../../../req-validators/auth";
import Link from "next/link";
import { useState } from "react";
import EyeIcon from "../../shared/icons/EyeIcon";
import { useRouter } from "next/navigation";

export default function SignupPage() {
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	const initialValues = {
		name: "",
		email: "",
		phone: "",
		password: "",
	};

	const submitHandler = async (values) => {
		try {
			const request = await fetch(`/api/auth/signup`, {
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

			setSuccessMessage("You have been successfuly signed up.");

			setTimeout(() => {
				router.replace("/");
			}, 1000);
		} catch (error) {
			setErrorMessage(error.message);
			console.log(error);
		}
	};

	return (
		<div className="container welcome-container">
			<div className="welcome-header flex flex-col items-center">
				<Image
					src="/logo.png"
					alt="Rich Cafe Logo"
					className="logo"
					width={120}
					height={100}
				/>
				<h1>Welcome to Rich Cafe!</h1>
				<p className="tagline">
					Order delicious meals, get exclusive offers, and enjoy fast delivery.
				</p>
			</div>

			<Formik
				onSubmit={submitHandler}
				initialValues={initialValues}
				validationSchema={signupSchema}>
				{({ isSubmitting }) => (
					<Form id="registrationForm" className="form-card">
						<h2>Signup</h2>
						<div className="input-group">
							<label htmlFor="userName">Full Name:</label>
							<Field
								type="text"
								id="userName"
								name="name"
								placeholder="Enter your full name"
							/>
							<ErrorMessage
								component={"p"}
								name="name"
								className="text-xl text-red-500 mt-2"
							/>
						</div>
						<div className="input-group">
							<label htmlFor="email">Email:</label>
							<Field
								type="email"
								id="email"
								name="email"
								placeholder="e.g., you@example.com"
							/>
							<ErrorMessage
								component={"p"}
								name="email"
								className="text-xl text-red-500 mt-2"
							/>
						</div>
						<div className="input-group phone-input-group">
							<label htmlFor="phoneNumber">Phone Number:</label>
							<div className="phone-input-fields">
								<Field
									type="tel"
									id="phoneNumber"
									name="phone"
									placeholder="e.g., 08012345678"
								/>
							</div>
							<ErrorMessage
								component={"p"}
								name="phone"
								className="text-xl text-red-500 mt-2"
							/>
						</div>
						<div className="input-group phone-input-group">
							<label htmlFor="password">Password:</label>
							<div className="phone-input-fields-password !border-[0.1rem] !rounded-[0.8rem]">
								<Field
									type={showPassword ? "text" : "password"}
									id="password"
									name="password"
									className="!border-0 !rounded-none focus:!shadow-none !p-0"
									placeholder="e.g., 8012345678"
								/>
								<button
									onClick={() => setShowPassword(!showPassword)}
									type="button">
									{!showPassword && <EyeIcon.Visible />}
									{showPassword && <EyeIcon.Invisible />}
								</button>
							</div>
							<ErrorMessage
								component={"p"}
								name="password"
								className="text-xl text-red-500 mt-2"
							/>
						</div>
						<button type="submit" className="button primary-button">
							{isSubmitting ? "Submitting..." : "Continue"}
						</button>
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
					</Form>
				)}
			</Formik>

			<div className="admin-login-link">
				<p>
					Already have an account? <Link href="/auth/login">Login here</Link>
				</p>
			</div>
		</div>
	);
}

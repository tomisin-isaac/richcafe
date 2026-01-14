import Image from "next/image";
import { Formik, Form } from "formik";
export default function LoginPage() {
	return (
		<div className="container welcome-container">
			<div className="welcome-header">
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

			<Formik>
				{({ isSubmitting }) => (
					<Form id="registrationForm" className="form-card">
						<h2>Register or Login</h2>
						<div className="input-group">
							<label htmlFor="userName">Full Name:</label>
							<input
								type="text"
								id="userName"
								name="userName"
								placeholder="Enter your full name"
								required
							/>
						</div>
						<div className="input-group">
							<label htmlFor="email">Email:</label>
							<input
								type="email"
								id="email"
								name="email"
								placeholder="e.g., you@example.com"
								required
							/>
						</div>
						<div className="input-group phone-input-group">
							<label htmlFor="phoneNumber">Phone Number:</label>
							<div className="phone-input-fields">
								<select id="countryCode" name="countryCode" required>
									<option value="+234">+234 (Nigeria)</option>
									<option value="+1">+1 (USA/Canada)</option>
									<option value="+44">+44 (UK)</option>
								</select>
								<input
									type="tel"
									id="phoneNumber"
									name="phoneNumber"
									placeholder="e.g., 8012345678"
									required
								/>
							</div>
						</div>
						<button type="submit" className="button primary-button">
							Continue
						</button>
						<p id="registrationStatus" className="status-message"></p>
					</Form>
				)}
			</Formik>

			<div className="admin-login-link">
				<p>
					Are you an admin? <a href="admin-login.html">Login here</a>
				</p>
			</div>
		</div>
	);
}

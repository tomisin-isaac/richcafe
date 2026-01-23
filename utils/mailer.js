// lib/mailer.js
import nodemailer from "nodemailer";

export const mailer = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 587,
	secure: false,
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASS,
	},
});

export async function sendOtpEmail({ to, code }) {
	return mailer.sendMail({
		from: `${process.env.COMPANY_NAME} <${process.env.MAIL_USER}>`,
		to,
		subject: "Verify your account",
		html: `
			<p>Your verification code is:</p>
			<h2>${code}</h2>
			<p>This code expires in 10 minutes.</p>
		`,
	});
}

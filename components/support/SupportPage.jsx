"use client";
import React from "react";

export default function SupportPage() {
	return (
		<div className="support-container">
			<header className="support-header">
				<h1 className="support-title !p-0 !m-0">Customer Support</h1>
			</header>
			<section className="support-banner">
				<h2>
					Hey There, How
					<br />
					can we be of help ?
				</h2>
			</section>
			<p className="support-info">
				Have an issue with recent order, payments, your account? Speak to our
				support team
			</p>
			<div className="support-qr-container flex flex-col items-center justify-center">
				<img src="/qr code.png" alt="Support QR Code" className="support-qr" />
				<p className="support-scan-text">Scan me to talk to the support team</p>
			</div>
			<a
				href="https://wa.me/yourwhatsapplink"
				target="_blank"
				className="support-chat-btn">
				<i className="fab fa-whatsapp"></i> Chat with us
			</a>
		</div>
	);
}

"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Spinner from "../shared/Spinner";
import useAlert from "../shared/hooks/useAlert";
import { useRouter } from "next/navigation";
import ShortUniqueId from "short-unique-id";
import { useEffect } from "react";
export default function ProfilePage() {
	const { showAndHideAlert } = useAlert();
	const router = useRouter();
	const [submitting, setSubmitting] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [profilePic, setProfilePic] = useState({ file: null, url: "" });

	const { data } = useQuery({
		queryKey: ["me"],
		queryFn: async () => {
			const request = await fetch(`/api/auth/me`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error);
			}

			return response.user;
		},
		gcTime: 0,
	});

	useEffect(() => {
		if (data) {
			setProfilePic({ file: null, url: data.profilePicture ?? "" });
		}
	}, [data]);

	useEffect(() => {
		if (profilePic.file) {
			profilePicUpdate();
		}
	}, [profilePic]);

	const logout = async () => {
		try {
			setSubmitting(true);
			const request = await fetch(`/api/auth/logout`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error);
			}
			showAndHideAlert("success", "Logged out successfully");
			router.replace("/auth/login");
		} catch (error) {
			setSubmitting(false);
			showAndHideAlert("error", error.message);
		}
	};

	const profilePicUpdate = async () => {
		try {
			setUploading(true);
			let payload = { profilePicture: data?.profilePicture };

			if (profilePic.file) {
				const { randomUUID } = new ShortUniqueId({
					dictionary: "hex",
					length: 12,
				});
				const fileExtension = profilePic.file.type.split("/")[1];
				const key = `categories/${randomUUID()}.${fileExtension}`;
				const uploadUrlRes = await getUploadUrl(key, profilePic.file.type);
				await fetch(uploadUrlRes.url, {
					method: "PUT",
					headers: {
						"Content-Type": profilePic.file.type,
					},
					body: profilePic.file,
				});

				payload = {
					profilePicture: `${process.env.NEXT_PUBLIC_S3_BUCKET_PREFIX}${key}`,
				};
			}

			const request = await fetch(`/api/customer/profile-pic`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error);
			}

			showAndHideAlert("success", "Profile Picture updated");
			setUploading(false);
		} catch (error) {
			setUploading(false);
			showAndHideAlert("error", error.message);
		}
	};

	const getUploadUrl = async (key, contentType) => {
		try {
			const request = await fetch(`/api/customer/presign`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ key, contentType }),
			});

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error);
			}

			return response;
		} catch (error) {
			throw error;
		}
	};

	return (
		<div className="profile-container !w-full">
			<header className="profile-header">
				<a href="homepage.html" className="profile-back-btn">
					<i className="fas fa-arrow-left"></i>
				</a>
				<h1 className="profile-title !p-0 !m-0">Profile</h1>
			</header>
			<div className="profile-picture-section">
				<div className="profile-picture-wrapper">
					<div className="">
						<img
							src={profilePic.url ? profilePic.url : "/default-avatar.png"}
							alt="User Profile"
							className="profile-picture-img"
						/>
					</div>
					<label
						htmlFor="profile-image-upload"
						className={`profile-edit-icon ${
							uploading ? "pointer-events-none" : ""
						}`}>
						{uploading ? (
							<Spinner bg={"before:!bg-blue-800"} />
						) : (
							<i className="fas fa-pen"></i>
						)}
					</label>
					<input
						type="file"
						id="profile-image-upload"
						className="profile-image-input"
						accept="image/*"
						multiple={false}
						onChange={(e) => {
							if (e.target.files) {
								const file = [...e.target.files][0];
								const blob = new Blob([file], {
									type: file.type,
								});
								const url = URL.createObjectURL(blob);
								setProfilePic({ file, url });
								e.target.value = "";
							}
						}}
					/>
				</div>
				<h2 className="profile-username">{data?.name}</h2>
			</div>

			<div className="profile-info">
				<div className="profile-info-item">
					<span className="profile-info-label">Name:</span>
					<span className="profile-info-value profile-name">{data?.name}</span>
				</div>
				<div className="profile-info-item">
					<span className="profile-info-label">Email Address:</span>
					<span className="profile-info-value profile-email">
						{data?.email}
					</span>
				</div>
				<div className="profile-info-item">
					<span className="profile-info-label">Phone Number:</span>
					<span className="profile-info-value profile-phone">
						{data?.phone}
					</span>
				</div>
			</div>
			<div className="mt-3">
				<button
					onClick={logout}
					id="logout-btn"
					className="product-price-tag !bg-red-500">
					{submitting ? <Spinner /> : "Log out"}
				</button>
			</div>
		</div>
	);
}

"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { app } from "@/lib/firebase";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const router = useRouter();
	const auth = getAuth(app);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		try {
			await signInWithEmailAndPassword(auth, email, password);
			router.push("/chat");
		} catch (err: any) {
			setError("ログインに失敗しました: " + err.message);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
			<form
				onSubmit={handleLogin}
				className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
			>
				<h2 className="text-2xl font-bold mb-6 text-center">ログイン</h2>
				<div className="mb-4">
					<label className="block mb-1 text-gray-700">メールアドレス</label>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
						required
					/>
				</div>
				<div className="mb-6">
					<label className="block mb-1 text-gray-700">パスワード</label>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
						required
					/>
				</div>
						{error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
						<button
							type="submit"
							className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors mb-2"
						>
							ログイン
						</button>
						<a
							href="/signup"
							className="block w-full text-center text-blue-600 hover:underline text-sm mt-2"
						>
							サインアップはこちら
						</a>
			</form>
		</div>
	);
}

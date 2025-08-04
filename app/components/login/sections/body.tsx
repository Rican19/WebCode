"use client";

import { Button, Input } from "@heroui/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../../firebase";
import Cookies from "js-cookie";
import Image from "next/image";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State para sa password visibility

  // const handleLogin = async () => {
  //   try {
  //     const response = await axios.post("http://127.0.0.1:8000/api/login", {
  //       email,
  //       password,
  //     });

  //     sessionStorage.setItem("token", response.data.token);
  //     sessionStorage.setItem("email", email);

  //     if (response.status === 200) {
  //       setLoading(true);
  //       // localStorage.setItem("token", response.data.token);
  //       Cookies.set("token", response.data.token);

  //       router.push("/sections/dashboard");

  //       console.log("Login successful");
  //     }
  //   } catch (error) {
  //     // Handle error, e.g., show an error message
  //     setLoading(false);
  //     alert("Login failed. Please check your credentials.");
  //     console.error("Login failed", error);
  //   }
  // };

  //   const logoutToken = sessionStorage.getItem("token")
  //   console.log("Logout Token:", logoutToken);

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      setLoading(true);
      const token = await userCredential.user.getIdToken();
      // Store token locally
      Cookies.set("token", token);

      console.log("User logged in:", userCredential.user);
      router.push("/sections/dashboard");
    } catch (error) {
      alert("Login failed");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fffe] via-[#f0f9ff] to-[#e0f2fe] relative overflow-hidden">
      {/* Enhanced Professional Background - Enhanced nga professional background na nag-complement sa form */}
      <div className="absolute inset-0">
        {/* Subtle geometric patterns - Subtle nga geometric patterns na nag-match sa form design */}
        <div className="absolute inset-0 opacity-8">
          <div className="absolute top-20 left-20 w-32 h-32 border border-[#A0C878]/30 rounded-full"></div>
          <div className="absolute top-40 right-40 w-24 h-24 border border-[#143D60]/20 rounded-lg rotate-45"></div>
          <div className="absolute bottom-32 left-32 w-20 h-20 border border-[#EB5B00]/25 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-16 h-16 border border-[#A0C878]/30 rounded-lg rotate-12"></div>

          {/* Additional complementary shapes - Additional shapes para sa better visual balance */}
          <div className="absolute top-1/3 left-10 w-12 h-12 border border-[#143D60]/15 rounded-full"></div>
          <div className="absolute top-2/3 right-10 w-8 h-8 border border-[#A0C878]/20 rounded-lg rotate-45"></div>
          <div className="absolute top-1/2 left-1/3 w-6 h-6 bg-[#DDEB9D]/20 rounded-full"></div>
          <div className="absolute bottom-1/3 right-1/3 w-10 h-10 bg-[#A0C878]/10 rounded-lg rotate-12"></div>
        </div>

        {/* Enhanced gradient overlays - Enhanced gradient overlays para sa better depth */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#DDEB9D]/15 via-transparent to-[#A0C878]/8"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-white/20 via-transparent to-transparent"></div>

        {/* Subtle grid pattern - Subtle grid pattern para sa texture na nag-complement sa form */}
        <div className="absolute inset-0 opacity-3" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #143D60 0.5px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Main Container - Split layout inspired by reference design */}
      <div className="relative z-10 min-h-screen flex">

        {/* Left Side - Brand and Illustration - Kaliwa nga side para sa branding ug illustration */}
        <div className="flex-1 flex items-center justify-center p-12 lg:p-16">
          <div className="max-w-lg text-center">
            {/* Logo and Brand - Logo ug brand name */}
            <div className="mb-12">
              <div className="mb-6">
                {/* HealthRadar Logo - Circular blended logo */}
                <Image
                  src="/assets/logoHDRM.png"
                  alt="HealthRadar Logo"
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover mx-auto shadow-lg"
                />
              </div>

              <h1 className="text-4xl font-bold text-[#143D60] mb-2 tracking-tight">
                HealthRadar
              </h1>
              <p className="text-lg text-gray-600 font-medium">
                Your Education... Our Mission.
              </p>
            </div>

            {/* SVG Illustration - SVG illustration inspired by reference */}
            <div className="mb-8">
              <svg width="400" height="300" viewBox="0 0 400 300" className="mx-auto">
                {/* Phone/Device Frame - Phone frame para sa modern look */}
                <rect x="120" y="40" width="160" height="220" rx="20" ry="20" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2"/>
                <rect x="130" y="60" width="140" height="180" rx="8" ry="8" fill="white"/>

                {/* Screen Content - Screen content para sa healthcare theme */}
                <circle cx="150" cy="100" r="8" fill="#A0C878"/>
                <rect x="170" y="95" width="60" height="4" rx="2" fill="#e2e8f0"/>
                <rect x="170" y="105" width="40" height="4" rx="2" fill="#e2e8f0"/>

                <circle cx="150" cy="130" r="8" fill="#143D60"/>
                <rect x="170" y="125" width="70" height="4" rx="2" fill="#e2e8f0"/>
                <rect x="170" y="135" width="50" height="4" rx="2" fill="#e2e8f0"/>

                <circle cx="150" cy="160" r="8" fill="#EB5B00"/>
                <rect x="170" y="155" width="55" height="4" rx="2" fill="#e2e8f0"/>
                <rect x="170" y="165" width="65" height="4" rx="2" fill="#e2e8f0"/>

                {/* Chart/Graph - Simple chart representation */}
                <rect x="140" y="190" width="100" height="40" rx="4" fill="#f8fafc" stroke="#e2e8f0"/>
                <polyline points="150,220 160,210 170,215 180,205 190,200 200,195 210,190 220,185"
                         fill="none" stroke="#A0C878" strokeWidth="2"/>

                {/* Person Figure - Person figure para sa human touch */}
                <g transform="translate(300, 120)">
                  {/* Head */}
                  <circle cx="0" cy="0" r="15" fill="#fbbf24"/>
                  {/* Body */}
                  <rect x="-12" y="15" width="24" height="40" rx="12" fill="#3b82f6"/>
                  {/* Arms */}
                  <rect x="-20" y="20" width="8" height="25" rx="4" fill="#fbbf24"/>
                  <rect x="12" y="20" width="8" height="25" rx="4" fill="#fbbf24"/>
                  {/* Legs */}
                  <rect x="-8" y="55" width="6" height="30" rx="3" fill="#1f2937"/>
                  <rect x="2" y="55" width="6" height="30" rx="3" fill="#1f2937"/>
                </g>

                {/* Floating Elements - Floating elements para sa dynamic feel */}
                <circle cx="80" cy="80" r="3" fill="#A0C878" opacity="0.6"/>
                <circle cx="320" cy="60" r="2" fill="#143D60" opacity="0.4"/>
                <circle cx="90" cy="200" r="2.5" fill="#EB5B00" opacity="0.5"/>
                <circle cx="310" cy="220" r="2" fill="#A0C878" opacity="0.3"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Right Side - Clean Login Form - Tuo nga side para sa clean login form */}
        <div className="w-full max-w-md lg:max-w-lg flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            {/* Clean Login Card - Clean login card inspired by reference */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

              {/* Header - Clean header para sa login */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#143D60] mb-2">
                  Sign in to HealthRadar
                </h2>
                <p className="text-gray-600">
                  Welcome back! Please enter your details
                </p>
              </div>

              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                {/* Email Input - Clean email input */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                    Email
                  </label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="Enter your email"
                    className="w-full"
                    classNames={{
                      input: "text-gray-900 placeholder:text-gray-400",
                      inputWrapper: "border border-gray-300 hover:border-[#A0C878] focus-within:border-[#A0C878] focus-within:ring-1 focus-within:ring-[#A0C878] bg-white h-12"
                    }}
                    size="lg"
                    radius="md"
                    required
                    startContent={
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    }
                  />
                </div>

                {/* Password Input with visibility toggle - Password input na naa'y eye toggle */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
                    Password
                  </label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full"
                    classNames={{
                      input: "text-gray-900 placeholder:text-gray-400",
                      inputWrapper: "border border-gray-300 hover:border-[#A0C878] focus-within:border-[#A0C878] focus-within:ring-1 focus-within:ring-[#A0C878] bg-white h-12"
                    }}
                    size="lg"
                    radius="md"
                    required
                    startContent={
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    }
                    endContent={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          // Eye slash icon - Hide password
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          // Eye icon - Show password
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    }
                  />
                </div>

                {/* Forgot Password Link - Clean forgot password link */}
                <div className="flex justify-end">
                  <Link href="#" className="text-sm text-[#EB5B00] hover:text-[#143D60] font-medium transition-colors duration-200">
                    Forgot Password?
                  </Link>
                </div>

                {/* Login Button - Clean login button */}
                <Button
                  type="submit"
                  className="w-full bg-[#143D60] hover:bg-[#1e4a6b] text-white font-semibold py-3 transition-all duration-200"
                  onPress={handleLogin}
                  disabled={loading || !email || !password}
                  size="lg"
                  radius="md"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" color="white" />
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    "Login"
                  )}
                </Button>

                {/* Divider - Clean divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">New to HealthRadar?</span>
                  </div>
                </div>

                {/* Sign Up Button - Clean sign up button */}
                <Button
                  as={Link}
                  href="/components/signup"
                  variant="bordered"
                  className="w-full border-[#EB5B00] text-[#EB5B00] hover:bg-[#EB5B00] hover:text-white font-semibold py-3 transition-all duration-200"
                  size="lg"
                  radius="md"
                >
                  Create New Account
                </Button>
              </form>

              {/* Version Info - Version info para sa reference */}
              <div className="text-center mt-6">
                <p className="text-xs text-gray-400">Current Version: v4.6.8</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

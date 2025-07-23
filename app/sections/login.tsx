// "use client";

// import { Button, Input } from "@heroui/react";
// import Link from "next/link";
// import axios from "axios";
// import { useState } from "react";
// import { useRouter } from "next/navigation";

// // const [username, setUsername] = useState("");
// // const [password, setPassword] = useState("");

// // const handleLogin = async () => {

// //   try {
// //     const response = await axios.post("http://127.0.0.1:8000/api/login", {
// //       username,
// //       password,
// //     });

// //     if (response.status === 200) {
// //       // Handle successful login, e.g., redirect or show a success message
// //       console.log("Login successful");
// //     }
// //   } catch (error) {
// //     // Handle error, e.g., show an error message
// //     console.error("Login failed", error);
// //   }
// // };

// export default function Login() {
//   // Clear token on login page load
//   const router = useRouter();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleLogin = async () => {
//     try {
//       const response = await axios.post("http://127.0.0.1:8000/api/login", {
//         email,
//         password,
//       });

//       sessionStorage.setItem("token", response.data.token);
//       sessionStorage.setItem("email", email);
//       sessionStorage.setItem("password", password);

//       if (response.status === 200) {
//         localStorage.setItem("token", response.data.token);

//         // Optionally redirect the user or handle further actions after successful login
//         router.push("/sections/dashboard");
//         // Handle successful login, e.g., redirect or show a success message
//         console.log("Login successful");
//       }
//     } catch (error) {
//       // Handle error, e.g., show an error message
//       console.error("Login failed", error);
//     }
//     console.log("wowowo", sessionStorage);
//   };

//   return (
//     <div className="flex flex-col items-center justify-center h-screen bg-[#DDEB9D]">
//       <h1 className="text-4xl font-bold text-black">Login</h1>
//       <form className="flex flex-col mt-4 w-1/3 ">
//         <Input
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           type="text"
//           placeholder="Username"
//           className="mb-2 p-2  text-black"
//         />
//         <Input
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           placeholder="Password"
//           className="mb-2 p-2  text-black"
//         />
//         <div className="flex justify-evenly gap-4 w-full">
//           <Button
//             className="flex w-full text-white bg-[#143D60]"
//             onPress={handleLogin}
//           >
//             Login
//           </Button>
//           <Button
//             className="flex w-full text-white bg-[#EB5B00]"
//             as={Link}
//             href="/components/signup"
//           >
//             Sign up
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// }

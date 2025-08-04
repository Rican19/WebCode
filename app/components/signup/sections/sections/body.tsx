"use client";

import { Button, Input, Select, SelectItem } from "@heroui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";

export const Municipalities = [
  { key: "Lilo-an", value: "Lilo-an" },
  { key: "Mandaue", value: "Mandaue" },
  { key: "Consolacion", value: "Consolacion" },
];

export default function Signup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // State variables for form inputs
  const [Fname, setFname] = useState("");
  const [Lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [PhoneNumber, setPhoneNumber] = useState("");
  const [municipality, setMunicipality] = useState(Municipalities[0].key);

  // const handleSignup = async (event: { preventDefault: () => void }) => {
  //   event.preventDefault();

  //   try {
  //     const response = await axios.post(
  //       "http://127.0.0.1:8000/api/healthWorkers",
  //       {
  //         Fname: Fname,
  //         Lname: Lname,
  //         email: email,
  //         password: password,
  //         PhoneNumber: PhoneNumber,
  //         municipality: municipality,
  //       }
  //     );
  //     if (response.status === 200) {
  //       // Handle successful signup, e.g., redirect or show a success message
  //       //Cookies.set("token", response.data.token);
  //       console.log("Signup successful");
  //       setLoading(true);
  //       // Optionally redirect to login page or dashboard
  //       //router.push("http://localhost:3000");
  //       //router.push("/sections/dashboard");
  //       addToast({
  //         title: "Signup Successful",
  //         description: "You have successfully signed up.",
  //       });
  //       router.push("/components/login");
  //     }
  //     console.log("Signup response:", response.data);
  //   } catch (error) {
  //     console.error("Signup failed", error);
  //     addToast({
  //       title: "Signup Failed",
  //       description: "Input all fields correctly.",
  //     });
  //   }
  // };

  const handleSignup = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(
        doc(db, "healthradarDB", "users", "healthworker", user.uid),
        {
          Fname,
          Lname,
          email: user.email,
          PhoneNumber,
          municipality,
        }
      );

      console.log("Signup successful");
      router.push("/components/login");
    } catch (error) {
      console.error("Signup failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#DDEB9D]">
      <h1 className="text-4xl font-bold text-black">Sign Up</h1>
      <form
        className="flex flex-col mt-4 w-1/3 gap-2"
        method="POST"
        onSubmit={handleSignup}
      >
        <div className="flex gap-2 w-full">
          <Input
            type="text"
            placeholder="First Name"
            value={Fname}
            onChange={(e) => setFname(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Last Name"
            value={Lname}
            onChange={(e) => setLname(e.target.value)}
          />
        </div>
        <Input
          type="text"
          placeholder="Phone Number"
          value={PhoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {/* <Input type="password" placeholder="Confirm Password" /> */}
        {/* <Input
          type="file"
          // labelPlacement="outside"
          // label="upload id"
          className="text-black"
        /> */}
        <Select
          onChange={(e) => setMunicipality(e.target.value)}
          value={municipality}
          label="Select your municipality"
          className="w-full text-black "
          // classNames={{ base: "hover:bg-red-500" }}
        >
          {Municipalities.map((municipality) => (
            <SelectItem className="text-black" key={municipality.key}>
              {municipality.value}
            </SelectItem>
          ))}
        </Select>
        <Button
          type="submit"
          className="flex w-full text-white text-lg  bg-[#EB5B00]"
        >
          {loading ? <Spinner size="md" /> : "Sign Up"}
        </Button>
      </form>
    </div>
  );
}

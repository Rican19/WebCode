export function store({
  Fname,
  Lname,
  email,
  password,
  PhoneNumber,
  municipality,
}: {
  Fname: string;
  Lname: string;
  email: string;
  password: string;
  PhoneNumber: string;
  municipality: string;
}) {
  return fetch("http://127.0.0.1:8000/api/healthWorkers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    next: { tags: ["users"] },
    body: JSON.stringify({
      email: email,
      password: password,
      PhoneNumber: PhoneNumber,
      municipality: municipality,
      Fname: Fname,
      Lname: Lname,
    }),
  });
}

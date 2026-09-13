import { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";

export default function AuthScreen() {
  const [screen, setScreen] = useState("login");

  if (screen === "signup") {
    return (
      <Signup
        onLogin={() => setScreen("login")}
      />
    );
  }

  return (
    <Login
      onSignup={() => setScreen("signup")}
    />
  );
}
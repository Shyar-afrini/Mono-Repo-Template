import { LoginForm } from "@/features/auth/components/login/login-form";
import React from "react";

const Login = () => {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />   
      </div>
    </div>
  );
};

export default Login;

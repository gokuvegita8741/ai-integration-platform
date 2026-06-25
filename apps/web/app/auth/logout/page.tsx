"use client";

import React, { useEffect } from "react";
import { signOut } from "next-auth/react";


const Page = () => {
  useEffect(() => {
        signOut({
            callbackUrl: "/auth/login",
        });
    }, []);
    
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      Signing out...
    </div>
  )
}

export default Page
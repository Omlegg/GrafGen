"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
 const [isLogin, setIsLogin] = useState(true);
 
  const [formData, setFormData] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const router = useRouter();

    let errors_to_display:any = []
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    if (!isLogin && formData.password !== formData.confirmPassword) {
      errors_to_display.push("Passwords do not match")
      return;
    }

    const endpoint = isLogin ? "login" : "register";
    
    const res = await fetch(`http://localhost:5166/api/identity/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("accessToken", data.accessToken);
      window.location.href = "/";
    } else {
      alert("Authentication failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center  py-8">
      <form onSubmit={handleSubmit} className="p-8 rounded-xl shadow-md w-125 h-125 flex flex-col ustify-center align-middle">
        <h2 className="text-2xl text-center font-sans font-bold mb-4">{isLogin ? "Login" : "Register"}</h2>
        
        {!isLogin && (
          <input className="flex flex-row items-center bg-[#ffffff] w-full border max-w-2xl mt-2 my-3 py-4 px-6 mb-4 m-auto rounded-1xl " placeholder="Email" 
            onChange={e => setFormData({...formData, email: e.target.value})} />
        )}
        
        <input className="flex flex-row items-center bg-[#ffffff] border w-full max-w-2xl mt-2 my-3 py-4 px-6 m-auto rounded-1xl " placeholder="Username" 
          onChange={e => setFormData({...formData, username: e.target.value})} />
        
        <input className="flex flex-row items-center bg-[#ffffff] border w-full max-w-2xl mt-2 my-3 py-4 px-6 m-auto rounded-xs " type="password" placeholder="Password" 
          onChange={e => setFormData({...formData, password: e.target.value})} />
        
        {!isLogin && (
            <input className="lex flex-row items-center bg-[#ffffff] border w-full max-w-2xl mt-2 my-3 py-4 px-6 m-auto rounded-xs " type="password" placeholder="Confirm Password" 
              onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
          )}

        <button type="submit" className="w-full p-2 bg-[#2e386d] text-white rounded hover:bg-[#b0dcde]  transition-bg duration-300 ease-in-out hover:text-black hover:font-bold transition-text duration-300 ease-in-out">
          {isLogin ? "Sign In" : "Sign Up"}
        </button>

        <p className="mt-4 text-sm cursor-pointer text-[#315b85] font-semibold" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Need an account? Register" : "Have an account? Login"}
        </p>
         {errors_to_display && errors_to_display.length > 0 ? (
                  errors_to_display.map((error:any, index:any) => (
                    <p className="text-[#a2200c] font-semibold" key={index}>{error}</p>
                  ))
                ):null}
      </form>
    </div>
  );
}
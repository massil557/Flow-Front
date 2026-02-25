import { useState } from "react";
import { man,cevitalLogo } from "./Managment";
import LoginLogo from "../components/login-logo";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const navigate = useNavigate();
  const [focus, setFocus] = useState(null);
  const [userData, setUserData] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-6xl h-[500px] bg-[#1e2a55]  rounded-3xl shadow-2xl flex overflow-hidden">

        {/* LEFT SIDE */}
        <div className="hidden md:flex w-1/2 items-center justify-center relative bg-white">
        <div className="absolute top-6 left-6 w-40">      
              <img src={cevitalLogo} alt="Cevital Logo" className="w-40 object-contain" />
         </div>
          <img src={man} alt="Man illustration" className="w-[300] object-contain" />
         
        </div>


        <div className="w-full md:w-1/2 flex flex-col justify-center px-10 text-white relative">
<div className="absolute top-6 left-6 w-40"> 
                <LoginLogo />
</div>

          <h1 className="text-3xl font-semibold mb-8">Login</h1>

          {/* Username */}
          <div className="mb-4">
            <label className="text-sm text-gray-300">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              onFocus={() => setFocus("username")}
              onBlur={() => setFocus(null)}
              className={`w-full mt-2 px-4 py-3 rounded-xl bg-[#0f1833] outline-none transition-all
                ${
                  focus === "username"
                    ? "ring-2 ring-blue-400"
                    : "border border-transparent"
                }
              `}
              value={userData.username}
              onChange={handleInputChange}
              name="username"
            />
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="text-sm text-gray-300">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              onFocus={() => setFocus("password")}
              onBlur={() => setFocus(null)}
              className={`w-full mt-2 px-4 py-3 rounded-xl bg-[#0f1833] outline-none transition-all
                ${
                  focus === "password"
                    ? "ring-2 ring-blue-400"
                    : "border border-transparent"
                }
              `}
              value={userData.password}
              onChange={handleInputChange}
              name="password"
            />
          </div>

          <div className="text-right mb-6">
            <a href="#" className="text-sm text-blue-400 hover:underline">
              Forgot Password?
            </a>
          </div>

          
          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 hover:opacity-90 transition-all shadow-lg"
          onClick={() =>{
            navigate("/mainlayout");
          }}
          >
            Login
          </button>

          
        

          {/* Footer */}
          <p className="text-xs text-gray-500 mt-10 text-center">
            Terms and Services
          </p>
        </div>
      </div>
    </div>
  );
}

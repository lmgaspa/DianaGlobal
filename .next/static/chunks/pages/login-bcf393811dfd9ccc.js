(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[459],{3236:function(e,s,r){(window.__NEXT_P=window.__NEXT_P||[]).push(["/login",function(){return r(1153)}])},8521:function(e,s,r){"use strict";var t=r(5893),a=r(3299);let l=e=>(0,t.jsxs)("svg",{width:"24",height:"24",viewBox:"0 0 775 794",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e,children:[(0,t.jsx)("path",{d:"M775 405.797C775 373.248 772.362 349.496 766.653 324.865H395.408V471.773H613.32C608.929 508.282 585.204 563.264 532.482 600.209L531.743 605.127L649.124 696.166L657.256 696.979C731.943 627.921 775 526.315 775 405.797",fill:"#4285F4"}),(0,t.jsx)("path",{d:"M395.408 792.866C502.167 792.866 591.792 757.676 657.256 696.979L532.482 600.209C499.093 623.521 454.279 639.796 395.408 639.796C290.845 639.796 202.099 570.741 170.463 475.294L165.826 475.688L43.772 570.256L42.1759 574.698C107.198 704.013 240.758 792.866 395.408 792.866Z",fill:"#34A853"}),(0,t.jsx)("path",{d:"M170.463 475.294C162.116 450.662 157.285 424.269 157.285 397C157.285 369.728 162.116 343.338 170.024 318.706L169.803 313.46L46.2193 217.373L42.1759 219.299C15.3772 272.961 0 333.222 0 397C0 460.778 15.3772 521.036 42.1759 574.698L170.463 475.294",fill:"#FBBC05"}),(0,t.jsx)("path",{d:"M395.408 154.201C469.656 154.201 519.74 186.31 548.298 213.143L659.891 104.059C591.356 40.2812 502.167 1.13428 395.408 1.13428C240.758 1.13428 107.198 89.9835 42.1759 219.299L170.024 318.706C202.099 223.259 290.845 154.201 395.408 154.201",fill:"#EB4335"})]});s.Z=()=>(0,t.jsxs)("button",{className:"flex items-center justify-center w-50 h-12 mx-auto gap-5 rounded bg-white px-4 py-4 text-sm drop-shadow-md hover:bg-gray-50",onClick:()=>(0,a.signIn)("google",{callbackUrl:"/protected/dashboard"}),"aria-label":"Sign in with Google",children:[(0,t.jsx)(l,{})," ",(0,t.jsx)("span",{className:"text-black",children:"Continue with Google"})]})},1153:function(e,s,r){"use strict";r.r(s);var t=r(5893),a=r(7294),l=r(7846),i=r(6310),n=r(1664),d=r.n(n),o=r(1163),c=r(3299);r(8256);var m=r(8521);s.default=()=>{let e=(0,o.useRouter)(),[s,r]=(0,a.useState)(null),n=i.Ry({email:i.Z_().email("Invalid email address").required("Email is required"),password:i.Z_().required("Password is required")}),u=async s=>{try{let r=await (0,c.signIn)("credentials",{redirect:!1,email:s.email,password:s.password});if(null==r?void 0:r.error)throw Error("Login failed: "+r.error);let t=await (0,c.getSession)();if(!(null==t?void 0:t.user)||!("id"in t.user))throw Error("Failed to retrieve user session");let a=t.user.id;console.log("este \xe9 o userId:"+a),e.push({pathname:"/protected/dashboard",query:{userId:a,email:s.email}})}catch(e){r("Email or password are incorrect.")}};return(0,t.jsx)("div",{className:"flex items-center justify-center min-h-screen text-black bg-gray-100 dark:bg-black",children:(0,t.jsxs)("div",{className:"bg-white p-8 rounded shadow-md w-full max-w-md dark:bg-gray-900",children:[(0,t.jsx)("h1",{className:"text-2xl font-bold mb-6 text-center text-black dark:text-white",children:"Sign In"}),s&&(0,t.jsx)("p",{className:"text-red-500 text-sm text-center mb-4",children:s}),(0,t.jsx)(l.J9,{initialValues:{email:"",password:""},validationSchema:n,onSubmit:u,children:e=>{let{errors:s,touched:r}=e;return(0,t.jsxs)(l.l0,{children:[(0,t.jsxs)("div",{className:"mb-4",children:[(0,t.jsx)(l.gN,{type:"email",name:"email",placeholder:"Email Address",className:"w-full p-2 border ".concat(s.email&&r.email?"border-red-500":"border-gray-300"," rounded")}),(0,t.jsx)(l.Bc,{name:"email",component:"div",className:"text-red-500 text-sm mt-1"})]}),(0,t.jsxs)("div",{className:"mb-4",children:[(0,t.jsx)(l.gN,{type:"password",name:"password",placeholder:"Password",className:"w-full p-2 border ".concat(s.password&&r.password?"border-red-500":"border-gray-300"," rounded")}),(0,t.jsx)(l.Bc,{name:"password",component:"div",className:"text-red-500 text-sm mt-1"})]}),(0,t.jsx)("button",{type:"submit",className:"w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition",children:"Continue"}),(0,t.jsxs)("p",{className:"text-center text-sm mt-4 text-black dark:text-white",children:["Don't have an account?",(0,t.jsx)(d(),{href:"/signup",children:(0,t.jsx)("span",{className:"text-blue-500 hover:underline cursor-pointer ml-1",children:"Register here"})})]}),(0,t.jsx)("div",{className:"mt-4"})]})}}),(0,t.jsx)(m.Z,{})]})})}}},function(e){e.O(0,[12,888,774,179],function(){return e(e.s=3236)}),_N_E=e.O()}]);
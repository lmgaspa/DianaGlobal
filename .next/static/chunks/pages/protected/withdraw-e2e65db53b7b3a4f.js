(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[915],{8311:function(e,t,a){(window.__NEXT_P=window.__NEXT_P||[]).push(["/protected/withdraw",function(){return a(5453)}])},5453:function(e,t,a){"use strict";a.r(t);var r=a(5893),s=a(7294),l=a(1163),n=a(7066);t.default=()=>{let e=(0,l.useRouter)(),[t,a]=(0,s.useState)(""),[o,d]=(0,s.useState)(""),[i,c]=(0,s.useState)(""),[u,h]=(0,s.useState)(0),[m,b]=(0,s.useState)("");(0,s.useEffect)(()=>{let{address:t}=e.query;"string"==typeof t&&a(t)},[e.query]),(0,s.useEffect)(()=>{let e=async()=>{try{if(t){let e=(await n.Z.get("https://api.bitcore.io/api/BTC/mainnet/address/".concat(t,"/balance"))).data.balance;console.log("Raw balance:",e);let a=parseFloat(e)/1e8;isNaN(a)?(console.error("Invalid balance:",e),h(0)):h(a)}}catch(e){console.error("Error fetching balance:",e),h(0)}};t&&e()},[t]);let p=()=>{let e=parseFloat(i);return e<1e-6?(b("Minimal amount for withdraw is 0.000001 BTC"),!1):e+1e-6>u?(b("Insufficient balance to cover withdrawal amount and fee."),!1):(b(""),console.log("Withdraw Address:",o),console.log("Withdraw Amount:",i),!0)};return(0,r.jsxs)("div",{className:"flex h-screen",children:[(0,r.jsxs)("div",{className:"w-3/10 p-4 border-r border-gray-300",children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("button",{className:"bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mr-4 w-full max-w-xs mb-2",onClick:()=>e.push({pathname:"/protected/dashboard"}),children:"Back to Dashboard"}),(0,r.jsx)("button",{className:"bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mr-4 w-full max-w-xs mb-2",onClick:()=>{e.push({pathname:"/protected/deposit",query:{address:t}})},children:"Deposit Crypto"})]}),(0,r.jsx)("button",{className:"bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mr-4 w-full max-w-xs",onClick:()=>{e.push({pathname:"/protected/withdraw",query:{address:t}})},children:"Withdraw"})]}),(0,r.jsxs)("div",{className:"w-7/10 p-4",children:[(0,r.jsx)("h2",{className:"text-lg font-semibold mb-4",children:"Withdraw Bitcoin"}),(0,r.jsxs)("p",{className:"mb-4",children:["Your Balance is: ",u.toFixed(8)," BTC"]}),(0,r.jsxs)("form",{onSubmit:e=>{e.preventDefault(),p()&&console.log("Proceed with withdrawal")},children:[(0,r.jsxs)("div",{className:"mb-4",children:[(0,r.jsx)("label",{className:"block text-sm font-medium text-gray-700",children:"Withdraw Address"}),(0,r.jsx)("input",{type:"text",value:o,onChange:e=>d(e.target.value),className:"mt-1 p-2 block w-full border border-gray-300 rounded-md",required:!0})]}),(0,r.jsxs)("div",{className:"mb-4",children:[(0,r.jsx)("label",{className:"block text-sm font-medium text-gray-700",children:"Withdraw Amount"}),(0,r.jsx)("input",{type:"number",step:"0.0001",value:i,onChange:e=>c(e.target.value),className:"mt-1 p-2 block w-full border border-gray-300 rounded-md",required:!0})]}),(0,r.jsx)("p",{className:"mb-4",children:"Minimal amount for withdraw is 0.000001 BTC"}),(0,r.jsx)("p",{className:"mb-4",children:"Fee for withdraw is 0.000001 BTC"}),m&&(0,r.jsx)("p",{className:"text-red-500 mb-4",children:m}),(0,r.jsx)("button",{type:"submit",className:"bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded",children:"Submit Withdraw"})]})]})]})}}},function(e){e.O(0,[143,888,774,179],function(){return e(e.s=8311)}),_N_E=e.O()}]);
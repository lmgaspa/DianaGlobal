(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[703],{9403:function(e,t,r){(window.__NEXT_P=window.__NEXT_P||[]).push(["/protected/dashboard",function(){return r(1243)}])},1243:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return d}});var s=r(5893);r(8256);var i=r(7294),n=r(7066),o=r(1163),a=r(3299),l=()=>{let[e,t]=(0,i.useState)(null),[r,l]=(0,i.useState)(null),{data:c}=(0,a.useSession)(),u=(0,o.useRouter)();return(0,i.useEffect)(()=>{(async()=>{if((null==c?void 0:c.user)&&!r)try{let e=await fetch("https://btcwallet-new.onrender.com/wallet/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:c.user.id})}),t=await e.json();l(t.btcaddress)}catch(e){console.error("Error fetching address:",e),l("")}})()},[c,r]),(0,i.useEffect)(()=>{(async()=>{try{if(r){let e=(await n.Z.get("https://api.bitcore.io/api/BTC/mainnet/address/".concat(r,"/balance"))).data.balance,s=parseFloat(e)/1e8;isNaN(s)?t(null):t(s)}}catch(e){console.error("Error fetching balance:",e),t(null)}})()},[r]),(0,s.jsxs)("div",{className:"flex flex-col items-center justify-center h-full",children:[(0,s.jsx)("h2",{className:"text-1xl font-bold mb-4",children:"Estimated Balance"}),c&&c.user&&(0,s.jsxs)("h1",{className:"text-1xl font-bold mb-2",children:["User ID: ",c.user.id]}),(0,s.jsxs)("h1",{className:"text-1xl font-bold mb-2",children:["BTC Address ",r||"Loading...",":"]}),null!==e?(0,s.jsxs)("p",{className:"mb-2",children:["Balance: ",e.toFixed(8)," BTC"]}):(0,s.jsx)("p",{children:"Loading balance..."}),(0,s.jsxs)("div",{className:"mt-8",children:[(0,s.jsx)("button",{className:"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4",onClick:()=>{r&&u.push({pathname:"/protected/deposit",query:{address:r}})},children:"Deposit"}),(0,s.jsx)("button",{className:"bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded",onClick:()=>{r&&u.push({pathname:"/protected/withdraw",query:{address:r}})},children:"Withdraw"})]})]})},c=r(2286),u=()=>{var e,t;let r=(0,o.useRouter)(),[n,l]=(0,i.useState)(null),{data:u,status:d}=(0,a.useSession)();(0,i.useEffect)(()=>{let e=(0,c.parseCookies)(null).session;e&&l(JSON.parse(e))},[]),(0,i.useEffect)(()=>{"unauthenticated"===d?r.push("/login"):"authenticated"===d&&((0,c.setCookie)(null,"session",JSON.stringify(u),{maxAge:2592e3,path:"/"}),l(u))},[d,r,u]);let f=async()=>{await (0,a.signOut)({redirect:!0,callbackUrl:"/"}),(0,c.destroyCookie)(null,"session"),l(null)};if("loading"===d)return(0,s.jsx)("p",{children:"Loading..."});let h=null==n?void 0:null===(e=n.user)||void 0===e?void 0:e.id,p=null==n?void 0:null===(t=n.user)||void 0===t?void 0:t.email;return(0,s.jsxs)("div",{className:"flex flex-col items-center justify-center h-full",children:[(0,s.jsx)("h1",{className:"text-2xl font-bold mb-4",children:"Login Successful"}),h&&(0,s.jsxs)("p",{className:"text-xl mb-4",children:["Welcome, ",(0,s.jsx)("br",{}),(0,s.jsx)("br",{}),"your user ID is: ",(0,s.jsx)("span",{className:"text-red-500",children:h})]}),p&&(0,s.jsxs)("p",{className:"text-xl mb-4",children:["E-mail: ",(0,s.jsx)("span",{className:"text-red-500",children:p})]}),(0,s.jsx)("button",{className:"bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4",onClick:f,children:"Logout"})]})},d=()=>(0,s.jsx)("div",{className:"flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black",children:(0,s.jsxs)("div",{className:"flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4",children:[(0,s.jsx)("div",{className:"bg-white p-8 rounded shadow-md w-96 h-96 text-center",children:(0,s.jsx)(u,{})}),(0,s.jsx)("div",{className:"bg-blue-200 p-8 rounded shadow-md w-96 h-96 text-center",children:(0,s.jsx)(l,{})})]})})},2286:function(e,t,r){"use strict";var s=this&&this.__assign||function(){return(s=Object.assign||function(e){for(var t,r=1,s=arguments.length;r<s;r++)for(var i in t=arguments[r])Object.prototype.hasOwnProperty.call(t,i)&&(e[i]=t[i]);return e}).apply(this,arguments)};Object.defineProperty(t,"__esModule",{value:!0}),t.destroyCookie=t.setCookie=t.parseCookies=void 0;var i=r(26),n=r(9328),o=r(1022);function a(e,t){var r,s;return(null===(s=null===(r=null==e?void 0:e.req)||void 0===r?void 0:r.headers)||void 0===s?void 0:s.cookie)?i.parse(e.req.headers.cookie,t):o.isBrowser()?i.parse(document.cookie,t):{}}function l(e,t,r,a){var l,c;if(void 0===a&&(a={}),(null===(l=null==e?void 0:e.res)||void 0===l?void 0:l.getHeader)&&e.res.setHeader){if(null===(c=null==e?void 0:e.res)||void 0===c?void 0:c.finished)return console.warn('Not setting "'+t+'" cookie. Response has finished.'),console.warn("You should set cookie before res.send()"),{};var u=e.res.getHeader("Set-Cookie")||[];"string"==typeof u&&(u=[u]),"number"==typeof u&&(u=[]);var d=n.parse(u,{decodeValues:!1}),f=o.createCookie(t,r,a),h=[];d.forEach(function(e){if(!o.areCookiesEqual(e,f)){var t=i.serialize(e.name,e.value,s({encode:function(e){return e}},e));h.push(t)}}),h.push(i.serialize(t,r,a)),e.res.setHeader("Set-Cookie",h)}if(o.isBrowser()){if(a&&a.httpOnly)throw Error("Can not set a httpOnly cookie in the browser.");document.cookie=i.serialize(t,r,a)}return{}}function c(e,t,r){return l(e,t,"",s(s({},r||{}),{maxAge:-1}))}t.parseCookies=a,t.setCookie=l,t.destroyCookie=c,t.default={set:l,get:a,destroy:c}},1022:function(e,t){"use strict";var r=this&&this.__assign||function(){return(r=Object.assign||function(e){for(var t,r=1,s=arguments.length;r<s;r++)for(var i in t=arguments[r])Object.prototype.hasOwnProperty.call(t,i)&&(e[i]=t[i]);return e}).apply(this,arguments)};function s(e,t){var r=Object.getOwnPropertyNames(e),s=Object.getOwnPropertyNames(t);if(r.length!==s.length)return!1;for(var i=0;i<r.length;i++){var n=r[i];if(e[n]!==t[n])return!1}return!0}Object.defineProperty(t,"__esModule",{value:!0}),t.areCookiesEqual=t.hasSameProperties=t.createCookie=t.isBrowser=void 0,t.isBrowser=function(){return"undefined"!=typeof window},t.createCookie=function(e,t,s){var i=s.sameSite;!0===i&&(i="strict"),(void 0===i||!1===i)&&(i="lax");var n=r(r({},s),{sameSite:i});return delete n.encode,r({name:e,value:t},n)},t.hasSameProperties=s,t.areCookiesEqual=function(e,t){var i=e.sameSite===t.sameSite;return"string"==typeof e.sameSite&&"string"==typeof t.sameSite&&(i=e.sameSite.toLowerCase()===t.sameSite.toLowerCase()),s(r(r({},e),{sameSite:void 0}),r(r({},t),{sameSite:void 0}))&&i}},26:function(e,t){"use strict";/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */t.parse=function(e,t){if("string"!=typeof e)throw TypeError("argument str must be a string");for(var s={},i=e.split(";"),n=(t||{}).decode||r,o=0;o<i.length;o++){var a=i[o],l=a.indexOf("=");if(!(l<0)){var c=a.substring(0,l).trim();if(void 0==s[c]){var u=a.substring(l+1,a.length).trim();'"'===u[0]&&(u=u.slice(1,-1)),s[c]=function(e,t){try{return t(e)}catch(t){return e}}(u,n)}}}return s},t.serialize=function(e,t,r){var n=r||{},o=n.encode||s;if("function"!=typeof o)throw TypeError("option encode is invalid");if(!i.test(e))throw TypeError("argument name is invalid");var a=o(t);if(a&&!i.test(a))throw TypeError("argument val is invalid");var l=e+"="+a;if(null!=n.maxAge){var c=n.maxAge-0;if(isNaN(c)||!isFinite(c))throw TypeError("option maxAge is invalid");l+="; Max-Age="+Math.floor(c)}if(n.domain){if(!i.test(n.domain))throw TypeError("option domain is invalid");l+="; Domain="+n.domain}if(n.path){if(!i.test(n.path))throw TypeError("option path is invalid");l+="; Path="+n.path}if(n.expires){if("function"!=typeof n.expires.toUTCString)throw TypeError("option expires is invalid");l+="; Expires="+n.expires.toUTCString()}if(n.httpOnly&&(l+="; HttpOnly"),n.secure&&(l+="; Secure"),n.sameSite)switch("string"==typeof n.sameSite?n.sameSite.toLowerCase():n.sameSite){case!0:case"strict":l+="; SameSite=Strict";break;case"lax":l+="; SameSite=Lax";break;case"none":l+="; SameSite=None";break;default:throw TypeError("option sameSite is invalid")}return l};var r=decodeURIComponent,s=encodeURIComponent,i=/^[\u0009\u0020-\u007e\u0080-\u00ff]+$/},9328:function(e){"use strict";var t={decodeValues:!0,map:!1,silent:!1};function r(e){return"string"==typeof e&&!!e.trim()}function s(e,s){var i,n,o,a,l=e.split(";").filter(r),c=(i=l.shift(),n="",o="",(a=i.split("=")).length>1?(n=a.shift(),o=a.join("=")):o=i,{name:n,value:o}),u=c.name,d=c.value;s=s?Object.assign({},t,s):t;try{d=s.decodeValues?decodeURIComponent(d):d}catch(e){console.error("set-cookie-parser encountered an error while decoding a cookie with value '"+d+"'. Set options.decodeValues to false to disable this feature.",e)}var f={name:u,value:d};return l.forEach(function(e){var t=e.split("="),r=t.shift().trimLeft().toLowerCase(),s=t.join("=");"expires"===r?f.expires=new Date(s):"max-age"===r?f.maxAge=parseInt(s,10):"secure"===r?f.secure=!0:"httponly"===r?f.httpOnly=!0:"samesite"===r?f.sameSite=s:f[r]=s}),f}function i(e,i){if(i=i?Object.assign({},t,i):t,!e)return i.map?{}:[];if(e.headers){if("function"==typeof e.headers.getSetCookie)e=e.headers.getSetCookie();else if(e.headers["set-cookie"])e=e.headers["set-cookie"];else{var n=e.headers[Object.keys(e.headers).find(function(e){return"set-cookie"===e.toLowerCase()})];n||!e.headers.cookie||i.silent||console.warn("Warning: set-cookie-parser appears to have been called on a request object. It is designed to parse Set-Cookie headers from responses, not Cookie headers from requests. Set the option {silent: true} to suppress this warning."),e=n}}return(Array.isArray(e)||(e=[e]),(i=i?Object.assign({},t,i):t).map)?e.filter(r).reduce(function(e,t){var r=s(t,i);return e[r.name]=r,e},{}):e.filter(r).map(function(e){return s(e,i)})}e.exports=i,e.exports.parse=i,e.exports.parseString=s,e.exports.splitCookiesString=function(e){if(Array.isArray(e))return e;if("string"!=typeof e)return[];var t,r,s,i,n,o=[],a=0;function l(){for(;a<e.length&&/\s/.test(e.charAt(a));)a+=1;return a<e.length}for(;a<e.length;){for(t=a,n=!1;l();)if(","===(r=e.charAt(a))){for(s=a,a+=1,l(),i=a;a<e.length&&"="!==(r=e.charAt(a))&&";"!==r&&","!==r;)a+=1;a<e.length&&"="===e.charAt(a)?(n=!0,a=i,o.push(e.substring(t,s)),t=a):a=s+1}else a+=1;(!n||a>=e.length)&&o.push(e.substring(t,e.length))}return o}}},function(e){e.O(0,[143,888,774,179],function(){return e(e.s=9403)}),_N_E=e.O()}]);
/* eslint-disable */
//prettier-ignore
module.exports = {
name: "@yarnpkg/plugin-prepare",
factory: function (require) {
var plugin=(()=>{var l=Object.create,n=Object.defineProperty;var t=Object.getOwnPropertyDescriptor;var s=Object.getOwnPropertyNames;var c=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty;var d=r=>n(r,"__esModule",{value:!0});var f=r=>{if(typeof require!="undefined")return require(r);throw new Error('Dynamic require of "'+r+'" is not supported')};var m=(r,e)=>{for(var o in e)n(r,o,{get:e[o],enumerable:!0})},u=(r,e,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of s(e))!a.call(r,i)&&i!=="default"&&n(r,i,{get:()=>e[i],enumerable:!(o=t(e,i))||o.enumerable});return r},g=r=>u(d(n(r!=null?l(c(r)):{},"default",r&&r.__esModule&&"default"in r?{get:()=>r.default,enumerable:!0}:{value:r,enumerable:!0})),r);var x={};m(x,{default:()=>k});var p=g(f("child_process")),h={hooks:{afterAllInstalled(){p.default.execSync("npm run prepare --if-present",{stdio:"inherit"})}}},k=h;return x;})();
return plugin;
}
};

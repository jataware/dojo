"use strict";(self.webpackChunkdojo_docs_v_2=self.webpackChunkdojo_docs_v_2||[]).push([[332],{4968:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>l,contentTitle:()=>r,default:()=>h,frontMatter:()=>a,metadata:()=>s,toc:()=>c});var i=t(5893),o=t(1151),d=t(4285);const a={layout:"default",title:"Aggregation Methods",parent:"Data Modeling"},r="Aggregation Methods for Data Modeling",s={id:"data-modeling/aggregation-methods",title:"Aggregation Methods",description:"In the Data Modeling Load Nodes, regridding methods need to be selected if the data is going to be geographically and/or temporally regridded. This is the list of options available in both the Geo and Time Aggregation dropdowns:",source:"@site/docs/data-modeling/aggregation-methods.mdx",sourceDirName:"data-modeling",slug:"/data-modeling/aggregation-methods",permalink:"/dojo/data-modeling/aggregation-methods",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{layout:"default",title:"Aggregation Methods",parent:"Data Modeling"},sidebar:"dojoSidebar",previous:{title:"Data Modeling",permalink:"/dojo/data-modeling"},next:{title:"Dojo API",permalink:"/dojo/dojo-api"}},l={},c=[];function g(e){const n={a:"a",code:"code",em:"em",h1:"h1",li:"li",p:"p",ul:"ul",...(0,o.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.h1,{id:"aggregation-methods-for-data-modeling",children:"Aggregation Methods for Data Modeling"}),"\n","\n","\n",(0,i.jsx)(d.Z,{file:"data-modeling-aggregation-functions.png",width:"300px"}),"\n",(0,i.jsxs)(n.p,{children:["In the Data Modeling ",(0,i.jsx)(n.a,{href:"../data-modeling#load-node",children:"Load Nodes"}),", regridding methods need to be selected if the data is going to be geographically and/or temporally regridded. This is the list of options available in both the Geo and Time Aggregation dropdowns:"]}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"conserve"})," - maintain the total sum of the data before and after (e.g. for regridding population)"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"min"})," - take the minimum value from each bucket during regridding"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"max"})," - take the maximum value from each bucket during regridding"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"mean"})," - take the mean value from each bucket during regridding. ",(0,i.jsxs)(n.em,{children:["Note: Use interp_or_mean instead of ",(0,i.jsx)(n.code,{children:"mean"}),", since it doesn't handle well when increasing the resolution of the data"]})]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"median"})," - take the median value from each bucket during regridding"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"mode"}),"  - take the mode of each bucket during regridding. ",(0,i.jsxs)(n.em,{children:["Note: Use nearest_or_mode instead of ",(0,i.jsx)(n.code,{children:"mode"}),", since it doesn't handle well when increasing the resolution of the data"]})]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"interp_or_mean"}),"  - if increasing resolution, interpolate the data. If decreasing resolution, take the mean of each bucket"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"nearest_or_mode"}),"  - if increasing resolution, take the nearest data. if decreasing resolution, take the mode of each bucket"]}),"\n"]})]})}function h(e={}){const{wrapper:n}={...(0,o.a)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(g,{...e})}):g(e)}},4285:(e,n,t)=>{t.d(n,{Z:()=>d});t(7294);var i=t(4996),o=t(5893);function d(e){let{width:n,file:t,title:d}=e;return(0,o.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center"},children:[(0,o.jsx)("img",{src:(0,i.Z)(`/img/${t}`),width:n,alt:d}),(0,o.jsx)("p",{children:(0,o.jsx)("i",{children:d})})]})}},1151:(e,n,t)=>{t.d(n,{Z:()=>r,a:()=>a});var i=t(7294);const o={},d=i.createContext(o);function a(e){const n=i.useContext(d);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:a(e.components),i.createElement(d.Provider,{value:n},e.children)}}}]);
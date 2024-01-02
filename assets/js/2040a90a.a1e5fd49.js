"use strict";(self.webpackChunkdojo_docs_v_2=self.webpackChunkdojo_docs_v_2||[]).push([[541],{5441:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>l,contentTitle:()=>i,default:()=>h,frontMatter:()=>a,metadata:()=>s,toc:()=>o});var n=r(5893),d=r(1151);const a={layout:"default",title:"Geotemporal Format",parent:"Data Registration"},i=void 0,s={id:"data-registration/geotemporal-format",title:"Geotemporal Format",description:"Geotemporal Format",source:"@site/docs/data-registration/geotemporal-format.md",sourceDirName:"data-registration",slug:"/data-registration/geotemporal-format",permalink:"/data-registration/geotemporal-format",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{layout:"default",title:"Geotemporal Format",parent:"Data Registration"},sidebar:"dojoSidebar",previous:{title:"Data Registration",permalink:"/data-registration"},next:{title:"Preparing data for Dojo",permalink:"/data-registration/data-format"}},l={},o=[{value:"Geotemporal Format",id:"geotemporal-format",level:2},{value:"Contents",id:"contents",level:3},{value:"Overview",id:"overview",level:3},{value:"Date ranges",id:"date-ranges",level:3},{value:"Non-standard calendars",id:"non-standard-calendars",level:3},{value:"Reserved column names",id:"reserved-column-names",level:3}];function c(e){const t={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,d.a)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(t.h2,{id:"geotemporal-format",children:"Geotemporal Format"}),"\n",(0,n.jsx)(t.p,{children:"Dojo will optionally convert model data into the Geotemporal format used in several applications."}),"\n",(0,n.jsx)(t.h3,{id:"contents",children:"Contents"}),"\n",(0,n.jsx)(t.p,{children:"This document is will further describe the Geotemporal format and elaborate on some less common data registration scenarios."}),"\n",(0,n.jsxs)(t.ol,{children:["\n",(0,n.jsx)(t.li,{children:(0,n.jsx)(t.a,{href:"#overview",children:"Overview"})}),"\n",(0,n.jsx)(t.li,{children:(0,n.jsx)(t.a,{href:"#date-ranges",children:"Date ranges"})}),"\n",(0,n.jsx)(t.li,{children:(0,n.jsx)(t.a,{href:"#non-standard-calendars",children:"Non-standard calendars"})}),"\n",(0,n.jsx)(t.li,{children:(0,n.jsx)(t.a,{href:"#reserved-column-names",children:"Reserved column names"})}),"\n"]}),"\n",(0,n.jsx)(t.h3,{id:"overview",children:"Overview"}),"\n",(0,n.jsxs)(t.p,{children:["The Geotemporal format is a tabular data representation that is stored as gzipped parquet. Data will have a fixed set of columns plus arbitrary ",(0,n.jsx)(t.code,{children:"qualifier"})," columns:"]}),"\n",(0,n.jsxs)(t.table,{children:[(0,n.jsx)(t.thead,{children:(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.th,{children:"timestamp"}),(0,n.jsx)(t.th,{children:"country"}),(0,n.jsx)(t.th,{children:"admin1"}),(0,n.jsx)(t.th,{children:"admin2"}),(0,n.jsx)(t.th,{children:"admin3"}),(0,n.jsx)(t.th,{children:"lat"}),(0,n.jsx)(t.th,{children:"lng"}),(0,n.jsx)(t.th,{children:"feature"}),(0,n.jsx)(t.th,{children:"value"}),(0,n.jsx)(t.th,{children:"qualifier_1"})]})}),(0,n.jsxs)(t.tbody,{children:[(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:"1546318800"}),(0,n.jsx)(t.td,{children:"Ethiopia"}),(0,n.jsx)(t.td,{children:"Afar"}),(0,n.jsx)(t.td,{children:"Afar Zone 3"}),(0,n.jsx)(t.td,{children:"Gewane"}),(0,n.jsx)(t.td,{children:"10.16807"}),(0,n.jsx)(t.td,{children:"40.64634"}),(0,n.jsx)(t.td,{children:"feature1"}),(0,n.jsx)(t.td,{children:"1"}),(0,n.jsx)(t.td,{})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:"1561953600"}),(0,n.jsx)(t.td,{children:"Ethiopia"}),(0,n.jsx)(t.td,{children:"Afar"}),(0,n.jsx)(t.td,{children:"Afar Zone 3"}),(0,n.jsx)(t.td,{children:"Gewane"}),(0,n.jsx)(t.td,{children:"10.16807"}),(0,n.jsx)(t.td,{children:"40.64634"}),(0,n.jsx)(t.td,{children:"feature1"}),(0,n.jsx)(t.td,{children:"2"}),(0,n.jsx)(t.td,{})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:"1577854800"}),(0,n.jsx)(t.td,{children:"Ethiopia"}),(0,n.jsx)(t.td,{children:"Afar"}),(0,n.jsx)(t.td,{children:"Afar Zone 3"}),(0,n.jsx)(t.td,{children:"Gewane"}),(0,n.jsx)(t.td,{children:"10.16807"}),(0,n.jsx)(t.td,{children:"40.64634"}),(0,n.jsx)(t.td,{children:"feature1"}),(0,n.jsx)(t.td,{children:"3"}),(0,n.jsx)(t.td,{})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:"1546318800"}),(0,n.jsx)(t.td,{children:"Ethiopia"}),(0,n.jsx)(t.td,{children:"Afar"}),(0,n.jsx)(t.td,{children:"Afar Zone 3"}),(0,n.jsx)(t.td,{children:"Gewane"}),(0,n.jsx)(t.td,{children:"10.16807"}),(0,n.jsx)(t.td,{children:"40.64634"}),(0,n.jsx)(t.td,{children:"feature2"}),(0,n.jsx)(t.td,{children:"100"}),(0,n.jsx)(t.td,{children:"maize"})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:"1561953600"}),(0,n.jsx)(t.td,{children:"Ethiopia"}),(0,n.jsx)(t.td,{children:"Afar"}),(0,n.jsx)(t.td,{children:"Afar Zone 3"}),(0,n.jsx)(t.td,{children:"Gewane"}),(0,n.jsx)(t.td,{children:"10.16807"}),(0,n.jsx)(t.td,{children:"40.64634"}),(0,n.jsx)(t.td,{children:"feature2"}),(0,n.jsx)(t.td,{children:"90"}),(0,n.jsx)(t.td,{children:"maize"})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:"1577854800"}),(0,n.jsx)(t.td,{children:"Ethiopia"}),(0,n.jsx)(t.td,{children:"Afar"}),(0,n.jsx)(t.td,{children:"Afar Zone 3"}),(0,n.jsx)(t.td,{children:"Gewane"}),(0,n.jsx)(t.td,{children:"10.16807"}),(0,n.jsx)(t.td,{children:"40.64634"}),(0,n.jsx)(t.td,{children:"feature2"}),(0,n.jsx)(t.td,{children:"80"}),(0,n.jsx)(t.td,{children:"maize"})]})]})]}),"\n",(0,n.jsxs)(t.p,{children:["The fixed columns are ",(0,n.jsx)(t.code,{children:"[timestamp, country, admin1, admin2, admin3, lat, lng, feature, value]"}),". Here ",(0,n.jsx)(t.code,{children:"qualifier_1"})," is the name of the qualifier which qualifies ",(0,n.jsx)(t.code,{children:"feature2"}),". Note that the fixed columns are nullable, but data that does not have at least some notion of time or place is not particularly useful."]}),"\n",(0,n.jsxs)(t.p,{children:["Converting indicator datasets and model output is ",(0,n.jsx)(t.strong,{children:"THE GOAL"})," of the Dojo data pipeline. The above example is meant to illuminate in more detail the ",(0,n.jsx)(t.strong,{children:"target"})," format, but model output and indicator datasets are not expected to start in this format."]}),"\n",(0,n.jsxs)(t.p,{children:["This example is available in ",(0,n.jsx)(t.a,{target:"_blank",href:r(7096).Z+"",children:"gzipped parquet here"}),"."]}),"\n",(0,n.jsx)(t.h3,{id:"date-ranges",children:"Date ranges"}),"\n",(0,n.jsx)(t.p,{children:"In some instances a model may have date data that represents a range of dates for example:"}),"\n",(0,n.jsxs)(t.table,{children:[(0,n.jsx)(t.thead,{children:(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.th,{children:"Date"}),(0,n.jsx)(t.th,{children:"Country"}),(0,n.jsx)(t.th,{children:"Crop Index"})]})}),(0,n.jsxs)(t.tbody,{children:[(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:"2015/2016"}),(0,n.jsx)(t.td,{children:"Djibouti"}),(0,n.jsx)(t.td,{children:"0.7"})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:"2016/2017"}),(0,n.jsx)(t.td,{children:"Djibouti"}),(0,n.jsx)(t.td,{children:"0.8"})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:"2017/2018"}),(0,n.jsx)(t.td,{children:"Djibouti"}),(0,n.jsx)(t.td,{children:"0.9"})]})]})]}),"\n",(0,n.jsxs)(t.p,{children:["where ",(0,n.jsx)(t.code,{children:"2017/2018"})," represents start and end dates. The Geotemporal format supports only a single date field with the column name ",(0,n.jsx)(t.code,{children:"timestamp"}),", therefore a multi-date should be divided into separate columns. Using the above example, this would correspond to:"]}),"\n",(0,n.jsxs)(t.table,{children:[(0,n.jsx)(t.thead,{children:(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.th,{children:"Start Date"}),(0,n.jsx)(t.th,{children:"End Date"}),(0,n.jsx)(t.th,{children:"Country"}),(0,n.jsx)(t.th,{children:"Crop Index"})]})}),(0,n.jsxs)(t.tbody,{children:[(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:"2015"}),(0,n.jsx)(t.td,{children:"2016"}),(0,n.jsx)(t.td,{children:"Djibouti"}),(0,n.jsx)(t.td,{children:"0.7"})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:"2016"}),(0,n.jsx)(t.td,{children:"2017"}),(0,n.jsx)(t.td,{children:"Djibouti"}),(0,n.jsx)(t.td,{children:"0.8"})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:"2017"}),(0,n.jsx)(t.td,{children:"2018"}),(0,n.jsx)(t.td,{children:"Djibouti"}),(0,n.jsx)(t.td,{children:"0.9"})]})]})]}),"\n",(0,n.jsxs)(t.p,{children:["where one date would be marked as the ",(0,n.jsx)(t.code,{children:"primary_date = True"})," and another would become a ",(0,n.jsx)(t.code,{children:"feature"})," or ",(0,n.jsx)(t.code,{children:"qualifier"})," column, as described in the ",(0,n.jsx)(t.a,{href:"../data-registration",children:"data registration document"}),"."]}),"\n",(0,n.jsxs)(t.p,{children:["By convention, we expect that date ranges are represented by the first date of that range. For example, a date point representing the entire month of May, 2020 could be presented as ",(0,n.jsx)(t.code,{children:"5/1/2020"}),'. Alternatively, Dojo provides a mechanism for the user to "build a date" where ',(0,n.jsx)(t.code,{children:"month"})," and ",(0,n.jsx)(t.code,{children:"year"})," are in separate columns and there is no ",(0,n.jsx)(t.code,{children:"day"})," column."]}),"\n",(0,n.jsx)(t.h3,{id:"non-standard-calendars",children:"Non-standard calendars"}),"\n",(0,n.jsxs)(t.p,{children:["Dates are standardized according to the ",(0,n.jsx)(t.a,{href:"https://en.wikipedia.org/wiki/Gregorian_calendar",children:"Gregorion calendar"}),". An example of a non-standard calendar is the ",(0,n.jsx)(t.a,{href:"https://en.wikipedia.org/wiki/Ethiopian_calendar",children:"Ethiopian calendar"}),". Dates in a non-standard calendar should be converted to Gregorion datetime."]}),"\n",(0,n.jsx)(t.h3,{id:"reserved-column-names",children:"Reserved column names"}),"\n",(0,n.jsxs)(t.p,{children:["The Geotemporal format reserves the following column names: ",(0,n.jsx)(t.code,{children:"timestamp"}),", ",(0,n.jsx)(t.code,{children:"country"}),", ",(0,n.jsx)(t.code,{children:"admin1"}),", ",(0,n.jsx)(t.code,{children:"admin2"}),", ",(0,n.jsx)(t.code,{children:"admin3"}),", ",(0,n.jsx)(t.code,{children:"lat"}),", ",(0,n.jsx)(t.code,{children:"lng"}),", ",(0,n.jsx)(t.code,{children:"feature"}),", and ",(0,n.jsx)(t.code,{children:"value"}),". If data is submitted with these column names and not used to represent that entity, then the submitted column name will be appended with the suffix ",(0,n.jsx)(t.code,{children:"_non_primary"}),"."]})]})}function h(e={}){const{wrapper:t}={...(0,d.a)(),...e.components};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(c,{...e})}):c(e)}},7096:(e,t,r)=>{r.d(t,{Z:()=>n});const n=r.p+"assets/files/geotemporal_example_format.parquet-880088357a3a270b541f12d4ff7b5e26.gzip"},1151:(e,t,r)=>{r.d(t,{Z:()=>s,a:()=>i});var n=r(7294);const d={},a=n.createContext(d);function i(e){const t=n.useContext(a);return n.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function s(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:i(e.components),n.createElement(a.Provider,{value:t},e.children)}}}]);
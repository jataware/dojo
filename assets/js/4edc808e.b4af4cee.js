"use strict";(self.webpackChunkdojo_docs_v_2=self.webpackChunkdojo_docs_v_2||[]).push([[173],{7559:(e,t,o)=>{o.r(t),o.d(t,{assets:()=>d,contentTitle:()=>r,default:()=>m,frontMatter:()=>s,metadata:()=>l,toc:()=>c});var a=o(5893),i=o(1151),n=o(4285);const s={layout:"default",title:"Intro to Dojo",has_toc:!0},r=void 0,l={id:"index",title:"Intro to Dojo",description:"The Dojo Docs are in the process of being updated. Some pages and screenshots may be out of date while we bring them up to speed. Please contact Jataware with any questions that aren't answered here.",source:"@site/docs/index.mdx",sourceDirName:".",slug:"/",permalink:"/",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{layout:"default",title:"Intro to Dojo",has_toc:!0},sidebar:"dojoSidebar",next:{title:"Model Registration Video Tutorial",permalink:"/video-howtos/model-registration"}},d={},c=[{value:"Dojo Overview",id:"dojo-overview",level:2},{value:"Models in Dojo",id:"models-in-dojo",level:2},{value:"The Problem",id:"the-problem",level:3},{value:"Dojo&#39;s Solution",id:"dojos-solution",level:3},{value:"Datasets in Dojo",id:"datasets-in-dojo",level:2},{value:"Dataset Registration",id:"dataset-registration",level:3},{value:"Downstream Uses",id:"downstream-uses",level:3},{value:"Data Modeling",id:"data-modeling",level:3},{value:"Knowledge in Dojo",id:"knowledge-in-dojo",level:2},{value:"Document Upload and Search",id:"document-upload-and-search",level:3},{value:"AI Assistant",id:"ai-assistant",level:3}];function h(e){const t={a:"a",admonition:"admonition",h2:"h2",h3:"h3",p:"p",...(0,i.a)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(n.Z,{width:"300px",file:"Dojo_Logo_profile.png"}),"\n",(0,a.jsx)(t.admonition,{type:"info",children:(0,a.jsxs)(t.p,{children:["The Dojo Docs are in the process of being updated. Some pages and screenshots may be out of date while we bring them up to speed. Please contact ",(0,a.jsx)(t.a,{href:"mailto:dojo@jataware.com",children:"Jataware"})," with any questions that aren't answered here."]})}),"\n",(0,a.jsx)(n.Z,{width:"500px",file:"dojo-overview.png"}),"\n",(0,a.jsx)(t.h2,{id:"dojo-overview",children:"Dojo Overview"}),"\n",(0,a.jsxs)(t.p,{children:["Developed by ",(0,a.jsx)(t.a,{href:"https://jataware.com/",children:"Jataware Corporation"})," under DARPA\u2019s ",(0,a.jsx)(t.a,{href:"https://worldmodelers.com/",children:"World Modelers"})," program, Dojo offers a unique suite of capabilities that is designed to reduce the gap between scientists and decision makers through three modalities: scientific modeling and simulation, consolidation of heterogeneous data and analysis of documents, reports and briefing material. Dojo has the ability to radically democratize the wisdom of experts and make it available to those who need it most in the policymaking, national security and development sectors. Dojo offers seamless interoperability with ",(0,a.jsx)(t.a,{href:"https://app.causemos.ai/docs/",children:"Causemos"}),", an analysis interface that allows for the exploration of Dojo models, data and knowledge."]}),"\n",(0,a.jsx)(t.h2,{id:"models-in-dojo",children:"Models in Dojo"}),"\n",(0,a.jsx)(t.h3,{id:"the-problem",children:"The Problem"}),"\n",(0,a.jsx)(t.p,{children:"Scientific models can be written in a wide range of programming languages and structured in an endless diversity of configurations. Running them takes considerable expertise, leaving them difficult to manage without the specific skills of the initial developer. For example, models written in C++ are largely inaccessible to scientists who rely on Python, let alone to analysts with no computer programming expertise."}),"\n",(0,a.jsx)(t.p,{children:"Dojo's goal is to approach models as executable programs that can be run in any context. Whether a user submits a crop model written in Fortran, such as DSSAT, a locust hopper presence prediction model written in R or a custom model that relies on proprietary software such as Netica, Matlab or Excel, the goal is to be a domain agnostic hub for a wide breadth of scientific models."}),"\n",(0,a.jsx)(t.h3,{id:"dojos-solution",children:"Dojo's Solution"}),"\n",(0,a.jsx)(t.p,{children:"Dojo presents a novel solution to this problem: it offers scientists access to a highly instrumented web-based terminal emulation environment where they can install their model, annotate their model\u2019s configuration process, instruct the system on how to perform a simulation and finally identify and annotate the simulation result files and plots. Once completed, Dojo generates a Docker container of the model which allows for repeatable and reproducible model execution by ensuring a consistent compute environment."}),"\n",(0,a.jsx)(t.p,{children:"The Dojo system itself stores expansive metadata about models and their configurations, allowing for complex and unique models to be configured via an intuitive and consistent application programming interface (API). When it comes to model execution, all models registered to Dojo are executable via a single API, regardless of their scientific domain or programming language. This innovation enables tools like Causemos to provide a unified interface for analysts to configure model simulations without the need to write a single line of code."}),"\n",(0,a.jsx)(n.Z,{width:"600px",file:"intro-model-terminal.png",title:"The Model Terminal Emulator"}),"\n",(0,a.jsx)(t.h2,{id:"datasets-in-dojo",children:"Datasets in Dojo"}),"\n",(0,a.jsx)(t.h3,{id:"dataset-registration",children:"Dataset Registration"}),"\n",(0,a.jsx)(t.p,{children:"The key to most analytic tasks is appropriate data. For complex systems analysis this can present a major hurdle: oftentimes the data needed are in formats that are inaccessible to most analysts. For example, much climate data is produced in NetCDF format: an excellent format for compressing climate-scale data, but one that is totally inhospitable to analysts without strong programming skills."}),"\n",(0,a.jsx)(t.p,{children:"Dojo democratizes access to data from NetCDF, GeoTIFF, Excel and CSV file formats, ingesting them into a single interface for annotation by the Dojo user. Dojo relies on AI to assess each dataset at the time it is ingested to attempt to infer key pieces of information such as how the dataset stores and references time and space. Users have the ability to mark up the dataset and enrich the inferred metadata at the feature or column level, enabling Dojo to be more than just a metadata repository; instead Dojo offers a truly comprehensive search and retrieval capability at the data feature level."}),"\n",(0,a.jsx)(t.h3,{id:"downstream-uses",children:"Downstream Uses"}),"\n",(0,a.jsx)(t.p,{children:"Furthermore, once a dataset is registered to Dojo it is exportable in a consistent, canonical format which facilitates downstream analysis and visualization. Data can come into Dojo in many formats and fashions, but once in Dojo it can be retrieved and utilized in a highly consistent fashion. A famous saying is that \u201cData scientists spend 80% of their time on data wrangling.\u201d Dojo is purpose built to cut that number down dramatically while simultaneously exposing data in hard to access formats to non-technical decision makers and analysts. By providing a consistent data format, Dojo makes it possible for Causemos and other tools to generate ad hoc, high fidelity data visualizations and data dashboards without the need to implement custom, dataset specific code or tools."}),"\n",(0,a.jsx)(n.Z,{width:"600px",file:"intro-causemos.png",title:"Data Visualization in Causemos"}),"\n",(0,a.jsx)(t.h3,{id:"data-modeling",children:"Data Modeling"}),"\n",(0,a.jsx)(t.p,{children:"Additionally, Dojo offers a no-code data modeling interface tailored for easy manipulation, visualization and analysis of climate, weather and other gridded data. The Dojo data modeler can be used to derive key insights at the intersection of diverse information from domains including climate, hydrology, population, infrastructure, agriculture, energy and more. This drag and drop interface offers users the features, power and flexibility of state of the art data science libraries without requiring the extensive programming background necessary to effectively leverage tools like Xarray or Climate Data Operators."}),"\n",(0,a.jsx)(n.Z,{width:"600px",file:"intro-data-modeling.png",title:"The Data Modeling Tool"}),"\n",(0,a.jsx)(t.h2,{id:"knowledge-in-dojo",children:"Knowledge in Dojo"}),"\n",(0,a.jsx)(t.h3,{id:"document-upload-and-search",children:"Document Upload and Search"}),"\n",(0,a.jsx)(t.p,{children:"Dojo provides state of the art AI supported knowledge curation and retrieval mechanisms at enterprise scale. The first step in this is an intuitive interface for the bulk upload and annotation of PDFs, PowerPoint files and Word documents. Once ingested into the system, knowledge is easily searchable through Dojo\u2019s user interface and API."}),"\n",(0,a.jsx)(n.Z,{width:"600px",file:"intro-ai-assistant.png",title:"The Dojo AI Assistant"}),"\n",(0,a.jsx)(t.h3,{id:"ai-assistant",children:"AI Assistant"}),"\n",(0,a.jsx)(t.p,{children:"Dojo offers a modern ChatGPT-like interface for question answering with results that are grounded in your organization\u2019s knowledge base. All answers are cited, with specific references to information from the knowledge ingested into Dojo from the documents uploaded or otherwise added to the system. Users can quickly and easily open the cited documents, reports, presentations and publications to further validate and contextualize the information offered by the AI assistant."})]})}function m(e={}){const{wrapper:t}={...(0,i.a)(),...e.components};return t?(0,a.jsx)(t,{...e,children:(0,a.jsx)(h,{...e})}):h(e)}},4285:(e,t,o)=>{o.d(t,{Z:()=>n});o(7294);var a=o(4996),i=o(5893);function n(e){let{width:t,file:o,title:n}=e;return(0,i.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center"},children:[(0,i.jsx)("img",{src:(0,a.Z)(`/img/${o}`),width:t,alt:n}),(0,i.jsx)("p",{children:(0,i.jsx)("i",{children:n})})]})}},1151:(e,t,o)=>{o.d(t,{Z:()=>r,a:()=>s});var a=o(7294);const i={},n=a.createContext(i);function s(e){const t=a.useContext(n);return a.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function r(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:s(e.components),a.createElement(n.Provider,{value:t},e.children)}}}]);
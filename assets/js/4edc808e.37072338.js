"use strict";(self.webpackChunkdojo_docs_v_2=self.webpackChunkdojo_docs_v_2||[]).push([[173],{7559:(e,o,t)=>{t.r(o),t.d(o,{assets:()=>l,contentTitle:()=>r,default:()=>m,frontMatter:()=>s,metadata:()=>d,toc:()=>c});var n=t(5893),a=t(1151),i=t(4285);const s={layout:"default",title:"Intro to Dojo",has_toc:!0},r=void 0,d={id:"index",title:"Intro to Dojo",description:"The Dojo Docs are in the process of being updated. Some pages and screenshots may be out of date while we bring them up to speed. Please contact Jataware with any questions that aren't answered here.",source:"@site/docs/index.mdx",sourceDirName:".",slug:"/",permalink:"/dojo/",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{layout:"default",title:"Intro to Dojo",has_toc:!0},sidebar:"dojoSidebar",next:{title:"Model Registration",permalink:"/dojo/model-registration"}},l={},c=[{value:"Register and Execute Models",id:"register-and-execute-models",level:5},{value:"Register and Transform Datasets",id:"register-and-transform-datasets",level:5},{value:"Upload and Search Documents",id:"upload-and-search-documents",level:5},{value:"Contents",id:"contents",level:2},{value:"Model Registration",id:"model-registration",level:2},{value:"Data Registration",id:"data-registration",level:2},{value:"Model Execution",id:"model-execution",level:2},{value:"Documents",id:"documents",level:2},{value:"Dojo API",id:"dojo-api",level:2}];function h(e){const o={a:"a",admonition:"admonition",em:"em",h2:"h2",h5:"h5",li:"li",ol:"ol",p:"p",...(0,a.a)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(i.Z,{width:"300px",file:"Dojo_Logo_profile.png"}),"\n",(0,n.jsx)(o.admonition,{type:"info",children:(0,n.jsxs)(o.p,{children:["The Dojo Docs are in the process of being updated. Some pages and screenshots may be out of date while we bring them up to speed. Please contact ",(0,n.jsx)(o.a,{href:"mailto:dojo@jataware.com",children:"Jataware"})," with any questions that aren't answered here."]})}),"\n",(0,n.jsxs)(o.p,{children:["Dojo (",(0,n.jsx)(o.a,{href:"https://github.com/jataware/dojo",children:"https://github.com/jataware/dojo"}),") is a suite of software tools that enables domain experts to do three things:"]}),"\n",(0,n.jsx)(o.h5,{id:"register-and-execute-models",children:"Register and Execute Models"}),"\n",(0,n.jsx)(o.p,{children:"Modelers can register their models using Dojo's intuitive web based terminal emulator. Models can be executed via a standardized, expressive API by wrapping heterogenous models into a consistent interface for parameterization and transforming model outputs into a consistent, easy to consume format. Dojo models facilitate reproducible research by enabling modelers to containerize and share their models with guarantees that the model will perform as they expect outside their own compute environment."}),"\n",(0,n.jsx)(o.h5,{id:"register-and-transform-datasets",children:"Register and Transform Datasets"}),"\n",(0,n.jsx)(o.p,{children:"Dojo provides a mechanism for analysts and domain experts to register and transform datasets for use in downstream modeling workflows."}),"\n",(0,n.jsx)(o.h5,{id:"upload-and-search-documents",children:"Upload and Search Documents"}),"\n",(0,n.jsx)(o.p,{children:"Dojo also includes a document uploader and explorer, which is a means to manage an organization\u2019s knowledge and leverage it inside index model analysis workflows. Users can upload PDFs that are relevant to their analysis in order to surface them as evidence during the creation of an index model. Dojo offers a semantic search capability over these documents which unlocks the ability to discover information across thousands of PDF documents with ease."}),"\n",(0,n.jsx)(i.Z,{width:"700px",file:"landing-page.png",title:"Dojo Landing Page"}),"\n",(0,n.jsx)(o.h2,{id:"contents",children:"Contents"}),"\n",(0,n.jsxs)(o.ol,{children:["\n",(0,n.jsx)(o.li,{children:(0,n.jsx)(o.a,{href:"/dojo/model-registration",children:"Model Registration"})}),"\n",(0,n.jsx)(o.li,{children:(0,n.jsx)(o.a,{href:"/dojo/data-registration",children:"Data Registration"})}),"\n",(0,n.jsx)(o.li,{children:(0,n.jsx)(o.a,{href:"/dojo/model-execution",children:"Model Execution"})}),"\n",(0,n.jsx)(o.li,{children:(0,n.jsx)(o.a,{href:"./documents",children:"Documents"})}),"\n",(0,n.jsx)(o.li,{children:(0,n.jsx)(o.a,{href:"/dojo/dojo-api",children:"Dojo API"})}),"\n"]}),"\n",(0,n.jsx)(o.h2,{id:"model-registration",children:"Model Registration"}),"\n",(0,n.jsx)(o.p,{children:'The model registration workflow is designed to provide domain modelers with a friendly and familiar environment from which to install, setup, and execute their model. Throughout this process, the modeler is queried for key information about model metadata and how to parameterize the model. The modeler also annotates model outputs so that they can be automatically transformed into a ready-to-use and well understood format each time the model is executed. The final step of the model registration workflow is the publication of a working "black box" model Docker container to Dockerhub. These containers can run the model with a set of explicit directives; however the Dojo modeling engine is naive to the inner workings of the model container.'}),"\n",(0,n.jsx)(i.Z,{width:"700px",file:"containerization_environment_medium.png",title:"Dojo Containerization Environment"}),"\n",(0,n.jsx)(o.h2,{id:"data-registration",children:"Data Registration"}),"\n",(0,n.jsxs)(o.p,{children:["Dojo offers a powerful user-driven data normalization capability through its data registration workflow. This workflow is designed to allow analysts, modelers and other users to curate their own datasets for modeling and analysis. Dojo supports the registration of CSV, Excel File, GeoTiff or NetCDF; once registered, datasets are transformed into ",(0,n.jsx)(o.em,{children:"indicators"})," that are represented in a canonical parquet format with a well-defined structure. Typical examples of data that might be registered are indicators from the ",(0,n.jsx)(o.a,{href:"https://data.worldbank.org/",children:"World Bank"}),", ",(0,n.jsx)(o.a,{href:"http://www.fao.org/statistics/en/",children:"FAO"}),", or ",(0,n.jsx)(o.a,{href:"https://acleddata.com/",children:"ACLED"}),", however users can bring anything they think will be useful for modeling or other analyses."]}),"\n",(0,n.jsxs)(o.p,{children:["Through this process, Dojo captures metadata about the dataset's provenance as well as descriptors for each of its features in order to transform it into a ready-to-use and well understood format. You can learn more about the data registration process ",(0,n.jsx)(o.a,{href:"./data-registration.html",children:"here"}),"."]}),"\n",(0,n.jsxs)(o.p,{children:["Normalizing data and model outputs to a consistent Geotemporal format facilitates rapid inter-model comparison and visualization via platforms such as ",(0,n.jsx)(o.a,{href:"https://uncharted.software/",children:"Uncharted Software's"})," Causemos tool."]}),"\n",(0,n.jsx)(i.Z,{width:"500px",file:"causemos_viz.png",title:"Uncharted's Causemos Platform"}),"\n",(0,n.jsx)(o.h2,{id:"model-execution",children:"Model Execution"}),"\n",(0,n.jsx)(o.p,{children:"This section provides information on how to use Dojo's model execution CLI. This tool enables users to execute Dojo models locally via Docker."}),"\n",(0,n.jsx)(o.h2,{id:"documents",children:"Documents"}),"\n",(0,n.jsx)(o.p,{children:"This tool enables users to upload and search through large numbers of PDF documents."}),"\n",(0,n.jsx)(o.h2,{id:"dojo-api",children:"Dojo API"}),"\n",(0,n.jsx)(o.p,{children:"This section provides an overview of how to interact with the Dojo API for model discovery, model execution, fetching model runs, and debugging models."})]})}function m(e={}){const{wrapper:o}={...(0,a.a)(),...e.components};return o?(0,n.jsx)(o,{...e,children:(0,n.jsx)(h,{...e})}):h(e)}},4285:(e,o,t)=>{t.d(o,{Z:()=>i});t(7294);var n=t(4996),a=t(5893);function i(e){let{width:o,file:t,title:i}=e;return(0,a.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center"},children:[(0,a.jsx)("img",{src:(0,n.Z)(`/img/${t}`),width:o,alt:i}),(0,a.jsx)("p",{children:(0,a.jsx)("i",{children:i})})]})}},1151:(e,o,t)=>{t.d(o,{Z:()=>r,a:()=>s});var n=t(7294);const a={},i=n.createContext(a);function s(e){const o=n.useContext(i);return n.useMemo((function(){return"function"==typeof e?e(o):{...o,...e}}),[o,e])}function r(e){let o;return o=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:s(e.components),n.createElement(i.Provider,{value:o},e.children)}}}]);
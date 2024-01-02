"use strict";(self.webpackChunkdojo_docs_v_2=self.webpackChunkdojo_docs_v_2||[]).push([[288],{1469:(e,o,t)=>{t.r(o),t.d(o,{assets:()=>d,contentTitle:()=>s,default:()=>c,frontMatter:()=>a,metadata:()=>r,toc:()=>l});var n=t(5893),i=t(1151);const a={layout:"default",title:"Frequently Asked Questions"},s="Dojo / World Modelers FAQ",r={id:"FAQ",title:"Frequently Asked Questions",description:"1. Will my model be a good fit for running in Dojo?",source:"@site/docs/FAQ.md",sourceDirName:".",slug:"/FAQ",permalink:"/FAQ",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{layout:"default",title:"Frequently Asked Questions"},sidebar:"dojoSidebar",previous:{title:"CLI Commands",permalink:"/model-execution/dojo-cli"}},d={},l=[{value:"1. Will my model be a good fit for running in Dojo?",id:"1-will-my-model-be-a-good-fit-for-running-in-dojo",level:2},{value:"2. Can I register Windows applications/models?",id:"2-can-i-register-windows-applicationsmodels",level:2},{value:"3. What if my data doesn\u2019t have a temporal or geospatial dimension?",id:"3-what-if-my-data-doesnt-have-a-temporal-or-geospatial-dimension",level:2},{value:"4. Running my model requires X number of steps, but there\u2019s only one directive, how can I make this work?",id:"4-running-my-model-requires-x-number-of-steps-but-theres-only-one-directive-how-can-i-make-this-work",level:2},{value:"5. What if I need to download the latest data for each model run?",id:"5-what-if-i-need-to-download-the-latest-data-for-each-model-run",level:2},{value:"6. What if my code and/or model is not allowed to be shared with the public?",id:"6-what-if-my-code-andor-model-is-not-allowed-to-be-shared-with-the-public",level:2},{value:"7. How do I cite Dojo in papers?",id:"7-how-do-i-cite-dojo-in-papers",level:2},{value:"8. What if I need to make changes to the model in the future?",id:"8-what-if-i-need-to-make-changes-to-the-model-in-the-future",level:2},{value:"9. What languages can my model be written in?",id:"9-what-languages-can-my-model-be-written-in",level:2},{value:"10. What data file formats can Dojo process?",id:"10-what-data-file-formats-can-dojo-process",level:2}];function h(e){const o={a:"a",h1:"h1",h2:"h2",p:"p",...(0,i.a)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(o.h1,{id:"dojo--world-modelers-faq",children:"Dojo / World Modelers FAQ"}),"\n",(0,n.jsx)(o.h2,{id:"1-will-my-model-be-a-good-fit-for-running-in-dojo",children:"1. Will my model be a good fit for running in Dojo?"}),"\n",(0,n.jsx)(o.p,{children:"To be a good fit for Dojo your model should be able to run in a Debian/Ubuntu based environment."}),"\n",(0,n.jsx)(o.p,{children:"It is also useful, but not necessary, to make the most relevant input parameters perturbable before the model run which allows analysts to run \u201cwhat-if\u201d scenarios with your model."}),"\n",(0,n.jsx)(o.p,{children:"Another useful practice when preparing a model for dojo is to move all configuration settings to a configuration file."}),"\n",(0,n.jsx)(o.h2,{id:"2-can-i-register-windows-applicationsmodels",children:"2. Can I register Windows applications/models?"}),"\n",(0,n.jsx)(o.p,{children:"At this time, no, Windows applications cannot be registered in Dojo"}),"\n",(0,n.jsx)(o.h2,{id:"3-what-if-my-data-doesnt-have-a-temporal-or-geospatial-dimension",children:"3. What if my data doesn\u2019t have a temporal or geospatial dimension?"}),"\n",(0,n.jsx)(o.p,{children:"Data should have temportal or a geospatial dimension. If the data is current you can add the current year to the data so it will fit with the required geotemporal format."}),"\n",(0,n.jsx)(o.h2,{id:"4-running-my-model-requires-x-number-of-steps-but-theres-only-one-directive-how-can-i-make-this-work",children:"4. Running my model requires X number of steps, but there\u2019s only one directive, how can I make this work?"}),"\n",(0,n.jsx)(o.p,{children:"Frequently, this can be resolved by wrapping your steps in a simple bash script, and the bash script can be set as the directive"}),"\n",(0,n.jsx)(o.h2,{id:"5-what-if-i-need-to-download-the-latest-data-for-each-model-run",children:"5. What if I need to download the latest data for each model run?"}),"\n",(0,n.jsx)(o.p,{children:"It is possible to to use curl or wget to download data, or to do so directly in your model code, but this is generally not recommended as broken download links is one of the most common causes of failure when running models."}),"\n",(0,n.jsx)(o.h2,{id:"6-what-if-my-code-andor-model-is-not-allowed-to-be-shared-with-the-public",children:"6. What if my code and/or model is not allowed to be shared with the public?"}),"\n",(0,n.jsx)(o.p,{children:"Hold off on registering the model until you talk with us. Dojo's current workflow will publish a public docker image of the model to dockerhub, so it would be possible for someone to access the code or data within that image."}),"\n",(0,n.jsx)(o.h2,{id:"7-how-do-i-cite-dojo-in-papers",children:"7. How do I cite Dojo in papers?"}),"\n",(0,n.jsxs)(o.p,{children:["Jataware (2022). Dojo: Dojo modeling is a repository for registering, storing, and running data-science models. Washington DC, United States. Available from: ",(0,n.jsx)(o.a,{href:"https://github.com/dojo-modeling/dojo",children:"https://github.com/dojo-modeling/dojo"}),"."]}),"\n",(0,n.jsx)(o.h2,{id:"8-what-if-i-need-to-make-changes-to-the-model-in-the-future",children:"8. What if I need to make changes to the model in the future?"}),"\n",(0,n.jsx)(o.p,{children:"Dojo uses a versioning system where once a model is published it becomes unchangeable. However at any point you can create a new version of the model, cloning the existing model into a brand new model. Publishing this clone replaces the previous version of the model for purposes or running."}),"\n",(0,n.jsx)(o.h2,{id:"9-what-languages-can-my-model-be-written-in",children:"9. What languages can my model be written in?"}),"\n",(0,n.jsx)(o.p,{children:"Dojo is language agnostic, as long as the resulting binaries or code can be executed in a Debian/Ubuntu based environment. During model registration modelers can install any required runtimes or libraries needed."}),"\n",(0,n.jsx)(o.h2,{id:"10-what-data-file-formats-can-dojo-process",children:"10. What data file formats can Dojo process?"}),"\n",(0,n.jsx)(o.p,{children:"Dojo supports excel, csv, geotiff, shapefiles, and netcdf output files."})]})}function c(e={}){const{wrapper:o}={...(0,i.a)(),...e.components};return o?(0,n.jsx)(o,{...e,children:(0,n.jsx)(h,{...e})}):h(e)}},1151:(e,o,t)=>{t.d(o,{Z:()=>r,a:()=>s});var n=t(7294);const i={},a=n.createContext(i);function s(e){const o=n.useContext(a);return n.useMemo((function(){return"function"==typeof e?e(o):{...o,...e}}),[o,e])}function r(e){let o;return o=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:s(e.components),n.createElement(a.Provider,{value:o},e.children)}}}]);
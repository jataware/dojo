"use strict";(self.webpackChunkdojo_docs_v_2=self.webpackChunkdojo_docs_v_2||[]).push([[321],{6313:(e,o,n)=>{n.r(o),n.d(o,{assets:()=>d,contentTitle:()=>i,default:()=>h,frontMatter:()=>l,metadata:()=>s,toc:()=>a});var t=n(5893),r=n(1151);const l={layout:"default",title:"Excel Models",parent:"Model Registration"},i="Registering Excel Models in Dojo",s={id:"details/excel",title:"Excel Models",description:"To aid in running models written in Excel, Dojo has a helper tool that allows for the execution of .xlsx files with the ability to define dynamic parameters. Since models must be executable via the command line to be registered to Dojo, this allows modelers with Excel based models to register them into Dojo.",source:"@site/docs/details/excel.md",sourceDirName:"details",slug:"/details/excel",permalink:"/dojo/details/excel",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{layout:"default",title:"Excel Models",parent:"Model Registration"},sidebar:"dojoSidebar",previous:{title:"Cheatsheet",permalink:"/dojo/details/cheatsheet"},next:{title:"Jupyter Notebooks",permalink:"/dojo/details/jupyter"}},d={},a=[{value:"Excel-Model-Runner",id:"excel-model-runner",level:2},{value:"How to Register an Excel Model",id:"how-to-register-an-excel-model",level:2},{value:"Defining parameters",id:"defining-parameters",level:3},{value:"Registering your model",id:"registering-your-model",level:3}];function c(e){const o={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",...(0,r.a)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(o.h1,{id:"registering-excel-models-in-dojo",children:"Registering Excel Models in Dojo"}),"\n",(0,t.jsxs)(o.p,{children:["To aid in running models written in Excel, Dojo has a helper tool that allows for the execution of ",(0,t.jsx)(o.code,{children:".xlsx"})," files with the ability to define dynamic parameters. Since models must be executable via the command line to be registered to Dojo, this allows modelers with Excel based models to register them into Dojo."]}),"\n",(0,t.jsx)(o.h2,{id:"excel-model-runner",children:"Excel-Model-Runner"}),"\n",(0,t.jsxs)(o.p,{children:["The ",(0,t.jsx)(o.strong,{children:(0,t.jsx)(o.a,{href:"https://github.com/dojo-modeling/excel-model-runner",children:"Excel-Model-Runner"})})," is built on top of the excellent ",(0,t.jsx)(o.a,{href:"https://github.com/vinci1it2000/formulas",children:"formulas"})," library. To use it, you must identify specific cells that contain paramters for your model. These should be enumerated in either a ",(0,t.jsx)(o.code,{children:"JSON"})," or ",(0,t.jsx)(o.code,{children:"CSV"})," file. Once you have defined your parameters, the ",(0,t.jsx)(o.code,{children:"Excel-Model-Runner"})," interprets all formulas in your Excel workbook and uses them to calculate model results."]}),"\n",(0,t.jsx)(o.h2,{id:"how-to-register-an-excel-model",children:"How to Register an Excel Model"}),"\n",(0,t.jsx)(o.p,{children:"There are two key steps to registering an Excel model to Dojo:"}),"\n",(0,t.jsxs)(o.ol,{children:["\n",(0,t.jsx)(o.li,{children:"Define your parameters in a configuration file"}),"\n",(0,t.jsx)(o.li,{children:"Load your model to the containerization environment and execute it"}),"\n"]}),"\n",(0,t.jsx)(o.p,{children:"These steps are described below in more detail."}),"\n",(0,t.jsx)(o.h3,{id:"defining-parameters",children:"Defining parameters"}),"\n",(0,t.jsxs)(o.p,{children:["First, you must define the parameters or tunable knobs relied on by your model within your Excel workbook. Assume you have an Excel workbook with a sheet called ",(0,t.jsx)(o.code,{children:"Parameters"}),":"]}),"\n",(0,t.jsxs)("p",{align:"center",children:[(0,t.jsx)("img",{src:"../imgs/excel.png",width:"75%",title:"parameter"}),(0,t.jsx)("br",{}),(0,t.jsx)("i",{children:"Parameters in Excel Workbook"})]}),"\n",(0,t.jsxs)(o.p,{children:["The parameter for ",(0,t.jsx)(o.code,{children:"Rainfall"})," is in ",(0,t.jsx)(o.code,{children:"C5"}),", the one for ",(0,t.jsx)(o.code,{children:"Temperature"})," is in ",(0,t.jsx)(o.code,{children:"C6"}),", and the one for ",(0,t.jsx)(o.code,{children:"Fertilizer"})," is in ",(0,t.jsx)(o.code,{children:"C7"}),". You should create a file called ",(0,t.jsx)(o.code,{children:"params.json"})," which would contain the following:"]}),"\n",(0,t.jsx)(o.pre,{children:(0,t.jsx)(o.code,{children:'{\n  "Parameters.C5": "0.9",\n  "Parameters.C6": "0.9",\n  "Parameters.C7": "1.2"\n}\n'})}),"\n",(0,t.jsxs)(o.p,{children:["Alternatively, you could create a CSV called ",(0,t.jsx)(o.code,{children:"params.csv"})," which would contain:"]}),"\n",(0,t.jsx)(o.pre,{children:(0,t.jsx)(o.code,{children:"Parameters.C5,0.9,rainfall\nParameters.C6,0.9,temperature\nParameters.C7,1.2,fertilizer\n"})}),"\n",(0,t.jsx)(o.p,{children:"Either option will work."}),"\n",(0,t.jsx)(o.h3,{id:"registering-your-model",children:"Registering your model"}),"\n",(0,t.jsxs)(o.p,{children:["You should proceed to register your model just like any other model in Dojo. When asked to select a starting image, you should choose the ",(0,t.jsx)(o.code,{children:"Ubuntu-Analytics"})," one since the ",(0,t.jsx)(o.code,{children:"Excel-Model-Runner"})," is already installed there. Alternatively, you can install it by hand from ",(0,t.jsx)(o.a,{href:"https://github.com/dojo-modeling/excel-model-runner",children:"its Github page"}),"."]}),"\n",(0,t.jsxs)(o.p,{children:["Next, ensure that your model Excel file and your ",(0,t.jsx)(o.code,{children:"params.json"})," (or ",(0,t.jsx)(o.code,{children:"params.csv"}),") file are loaded into the containerization environment. You should use ",(0,t.jsx)(o.code,{children:"dojo config params.json"})," to annotate your config file. Then, execute the model with something like:"]}),"\n",(0,t.jsx)(o.pre,{children:(0,t.jsx)(o.code,{children:"run-excel-model my_model.xlsx params.json\n"})}),"\n",(0,t.jsx)(o.p,{children:"If the above doese not work, you may need to use the following:"}),"\n",(0,t.jsx)(o.pre,{children:(0,t.jsx)(o.code,{children:"python3 /usr/local/bin/run-excel-model my_model.xlsx params.json\n"})}),"\n",(0,t.jsxs)(o.p,{children:["Your results will be stored to the ",(0,t.jsx)(o.code,{children:"outputs"})," directory; from there you should use ",(0,t.jsx)(o.code,{children:"dojo annotate"})," to annotate them per the usual model registration workflow."]}),"\n",(0,t.jsxs)(o.blockquote,{children:["\n",(0,t.jsxs)(o.p,{children:["Note: if you need help getting your Excel model and parameter file into the containerization environment please reach out to ",(0,t.jsx)(o.a,{href:"mailto:dojo@jataware.com",children:"dojo@jataware.com"})]}),"\n"]})]})}function h(e={}){const{wrapper:o}={...(0,r.a)(),...e.components};return o?(0,t.jsx)(o,{...e,children:(0,t.jsx)(c,{...e})}):c(e)}},1151:(e,o,n)=>{n.d(o,{Z:()=>s,a:()=>i});var t=n(7294);const r={},l=t.createContext(r);function i(e){const o=t.useContext(l);return t.useMemo((function(){return"function"==typeof e?e(o):{...o,...e}}),[o,e])}function s(e){let o;return o=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:i(e.components),t.createElement(l.Provider,{value:o},e.children)}}}]);
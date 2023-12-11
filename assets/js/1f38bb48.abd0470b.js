"use strict";(self.webpackChunkdojo_docs_v_2=self.webpackChunkdojo_docs_v_2||[]).push([[622],{2716:(e,o,t)=>{t.r(o),t.d(o,{assets:()=>d,contentTitle:()=>r,default:()=>m,frontMatter:()=>l,metadata:()=>s,toc:()=>a});var n=t(5893),i=t(1151);const l={layout:"default",title:"MATLAB Models",parent:"Model Registration"},r="Registering MATLAB Models in Dojo",s={id:"model-registration/matlab",title:"MATLAB Models",description:"MATLAB is a proprietary software that requires a license to use. This presents a challenge to registering models into an environment where there is no software license for MATLAB. Conveniently, MATALB offers the option to compile model code into an executable that can be run using the MATLAB Runtime. MATLAB Runtime does not reqiure a MATLAB software license. To register a MATLAB model to Dojo it must first be compiled, then executed using the Runtime.",source:"@site/docs/model-registration/matlab.md",sourceDirName:"model-registration",slug:"/model-registration/matlab",permalink:"/dojo/model-registration/matlab",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{layout:"default",title:"MATLAB Models",parent:"Model Registration"},sidebar:"dojoSidebar",previous:{title:"Jupyter Notebooks",permalink:"/dojo/model-registration/jupyter"},next:{title:"Prebuilt Containers",permalink:"/dojo/model-registration/docker"}},d={},a=[{value:"Compiling MATLAB models",id:"compiling-matlab-models",level:2},{value:"Running the compiled model",id:"running-the-compiled-model",level:2},{value:"Registering the compiled model",id:"registering-the-compiled-model",level:2}];function c(e){const o={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",...(0,i.a)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(o.h1,{id:"registering-matlab-models-in-dojo",children:"Registering MATLAB Models in Dojo"}),"\n",(0,n.jsx)(o.p,{children:"MATLAB is a proprietary software that requires a license to use. This presents a challenge to registering models into an environment where there is no software license for MATLAB. Conveniently, MATALB offers the option to compile model code into an executable that can be run using the MATLAB Runtime. MATLAB Runtime does not reqiure a MATLAB software license. To register a MATLAB model to Dojo it must first be compiled, then executed using the Runtime."}),"\n",(0,n.jsx)(o.h2,{id:"compiling-matlab-models",children:"Compiling MATLAB models"}),"\n",(0,n.jsxs)(o.p,{children:["MATLAB has a comprehensive guide to compiling its code ",(0,n.jsx)(o.a,{href:"https://www.mathworks.com/help/compiler/create-and-install-a-standalone-application-from-matlab-code.html",children:"available here"}),". The most streamlined way to compile a model written in MATLAB is:"]}),"\n",(0,n.jsxs)(o.ol,{children:["\n",(0,n.jsx)(o.li,{children:"Select the main executable for the model"}),"\n",(0,n.jsxs)(o.li,{children:["Set ",(0,n.jsx)(o.code,{children:"Runtime downloaded from web"})]}),"\n",(0,n.jsxs)(o.li,{children:["Select ",(0,n.jsx)(o.code,{children:"package"})]}),"\n",(0,n.jsxs)(o.li,{children:["Use the ",(0,n.jsx)(o.code,{children:"for_redistribution_files_only"})," directory that the packaging process created. This contains the compiled model code and files."]}),"\n"]}),"\n",(0,n.jsx)(o.h2,{id:"running-the-compiled-model",children:"Running the compiled model"}),"\n",(0,n.jsxs)(o.p,{children:["To run the compiled model locally, you need to download MATLAB Runtime, which is ",(0,n.jsx)(o.a,{href:"https://www.mathworks.com/products/compiler/matlab-runtime.html",children:"available here"}),". Next you should execute the ",(0,n.jsx)(o.code,{children:".sh"})," file stored to ",(0,n.jsx)(o.code,{children:"build"})," and provide the path of the MATLAB Runtime executable."]}),"\n",(0,n.jsxs)(o.blockquote,{children:["\n",(0,n.jsx)(o.p,{children:"Note: you must execute the compiled model in the same environment that it was compiled. Since Dojo relies on Linux, you must compile your model in a Linux environment."}),"\n"]}),"\n",(0,n.jsx)(o.p,{children:"An example run of the compiled code may look like:"}),"\n",(0,n.jsx)(o.pre,{children:(0,n.jsx)(o.code,{children:"build/run_model.sh /usr/local/MATLAB/MATLAB_Runtime/v912\n"})}),"\n",(0,n.jsx)(o.h2,{id:"registering-the-compiled-model",children:"Registering the compiled model"}),"\n",(0,n.jsxs)(o.p,{children:["When selecting the base container during the provisioning step of model registration, select ",(0,n.jsx)(o.code,{children:"MATLAB"})," from the dropdown. This has the MATLAB Runtime pre-installed at ",(0,n.jsx)(o.code,{children:"/usr/local/MATLAB/MATLAB_Runtime/v912"}),". Now, you should run your compiled model and specify the parameters as you would normally. The Runtime will be able to execute the model and you can proceed annotating parameters, outputs, and media as you would normally."]})]})}function m(e={}){const{wrapper:o}={...(0,i.a)(),...e.components};return o?(0,n.jsx)(o,{...e,children:(0,n.jsx)(c,{...e})}):c(e)}},1151:(e,o,t)=>{t.d(o,{Z:()=>s,a:()=>r});var n=t(7294);const i={},l=n.createContext(i);function r(e){const o=n.useContext(l);return n.useMemo((function(){return"function"==typeof e?e(o):{...o,...e}}),[o,e])}function s(e){let o;return o=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:r(e.components),n.createElement(l.Provider,{value:o},e.children)}}}]);
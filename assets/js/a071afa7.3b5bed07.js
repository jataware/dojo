"use strict";(self.webpackChunkdojo_docs_v_2=self.webpackChunkdojo_docs_v_2||[]).push([[687],{5354:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>i,contentTitle:()=>r,default:()=>h,frontMatter:()=>a,metadata:()=>c,toc:()=>d});var o=t(5893),s=t(1151);const a={},r="Knowledge AI",c={id:"dev-docs/knowledge-ui",title:"Knowledge AI",description:"Dojo has support to upload, manage, search, and analyze document contents using",source:"@site/docs/dev-docs/knowledge-ui.mdx",sourceDirName:"dev-docs",slug:"/dev-docs/knowledge-ui",permalink:"/dev-docs/knowledge-ui",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"dojoSidebar",previous:{title:"Document Upload Architecture",permalink:"/dev-docs/document-upload-architecture"},next:{title:"Production Deployment",permalink:"/dev-docs/production-deployment"}},i={},d=[];function l(e){const n={blockquote:"blockquote",code:"code",h1:"h1",li:"li",ol:"ol",p:"p",ul:"ul",...(0,s.a)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(n.h1,{id:"knowledge-ai",children:"Knowledge AI"}),"\n",(0,o.jsx)(n.p,{children:"Dojo has support to upload, manage, search, and analyze document contents using\na large language model (LLM). This is similar to an AI chat agent integrated with documents that have been uploaded and analyzed by the Dojo system."}),"\n",(0,o.jsx)(n.p,{children:"Knowledge AI consists of:"}),"\n",(0,o.jsxs)(n.ul,{children:["\n",(0,o.jsx)(n.li,{children:"The Dojo UI interface (similar to chatgpt)"}),"\n",(0,o.jsx)(n.li,{children:"Dojo API endpoints, which use an LLM to stream or message (sync) a response that summarizes a query by the User"}),"\n",(0,o.jsx)(n.li,{children:"Elasticsearch, which contains the extracted text (paragraphs) from documents uploaded to the system, as well as the text embeddings"}),"\n"]}),"\n",(0,o.jsx)(n.h1,{id:"flow",children:"Flow"}),"\n",(0,o.jsxs)(n.ol,{children:["\n",(0,o.jsxs)(n.li,{children:["User types a query into the Dojo UI under ",(0,o.jsx)(n.code,{children:"/ai-assistant"}),". Example:"]}),"\n"]}),"\n",(0,o.jsxs)(n.blockquote,{children:["\n",(0,o.jsx)(n.p,{children:"What is the impact of climate change to subsistence farming on African countries?"}),"\n"]}),"\n",(0,o.jsxs)(n.ol,{start:"2",children:["\n",(0,o.jsx)(n.li,{children:"UI sends the request to the Dojo API."}),"\n",(0,o.jsx)(n.li,{children:"The Dojo API embeds the input text/query, and performs a semantic search, using the elastic search embeddings"}),"\n",(0,o.jsx)(n.li,{children:"From the search results, the Dojo API Knowledge engine sends a prompt to the chat agent, which includes instructions on what to do and the relevant search results."}),"\n",(0,o.jsx)(n.li,{children:"The Dojo API streams or sends (sync) the response to the Dojo UI."}),"\n"]}),"\n",(0,o.jsx)(n.p,{children:"The response will contain both the synthetized answer, as well as the semantic search hits for the paragraph text, the document title and ID and a URL to open the document (PDF) on a Dojo UI modal."})]})}function h(e={}){const{wrapper:n}={...(0,s.a)(),...e.components};return n?(0,o.jsx)(n,{...e,children:(0,o.jsx)(l,{...e})}):l(e)}},1151:(e,n,t)=>{t.d(n,{Z:()=>c,a:()=>r});var o=t(7294);const s={},a=o.createContext(s);function r(e){const n=o.useContext(a);return o.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:r(e.components),o.createElement(a.Provider,{value:n},e.children)}}}]);
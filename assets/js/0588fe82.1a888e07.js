"use strict";(self.webpackChunkdojo_docs_v_2=self.webpackChunkdojo_docs_v_2||[]).push([[238],{7091:(e,n,o)=>{o.r(n),o.d(n,{assets:()=>a,contentTitle:()=>i,default:()=>h,frontMatter:()=>t,metadata:()=>l,toc:()=>d});var s=o(5893),r=o(1151);const t={},i="Common Problems",l={id:"dev-docs/common-problems",title:"Common Problems",description:"ElasticSearch Host Out of Disk Space",source:"@site/docs/dev-docs/common-problems.mdx",sourceDirName:"dev-docs",slug:"/dev-docs/common-problems",permalink:"/dev-docs/common-problems",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"dojoSidebar",previous:{title:"Production Deployment",permalink:"/dev-docs/production-deployment"},next:{title:"Whitelabeling",permalink:"/dev-docs/whitelabeling"}},a={},d=[{value:"ElasticSearch Host Out of Disk Space",id:"elasticsearch-host-out-of-disk-space",level:2},{value:"This is mostly related to several factors:",id:"this-is-mostly-related-to-several-factors",level:3},{value:"Error you&#39;ll see from the Dojo API or RQWorker logs",id:"error-youll-see-from-the-dojo-api-or-rqworker-logs",level:3},{value:"Fixes",id:"fixes",level:3},{value:"With Kibana",id:"with-kibana",level:2},{value:"Viewing Docker Disk Usage",id:"viewing-docker-disk-usage",level:2}];function c(e){const n={code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",ul:"ul",...(0,r.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.h1,{id:"common-problems",children:"Common Problems"}),"\n",(0,s.jsx)(n.h2,{id:"elasticsearch-host-out-of-disk-space",children:"ElasticSearch Host Out of Disk Space"}),"\n",(0,s.jsx)(n.p,{children:"Ocassionally, and especially during development on a dev machine, you may run\ninto a problem where elasticsearch blocks any additional writes due to low\ndisk space."}),"\n",(0,s.jsx)(n.h3,{id:"this-is-mostly-related-to-several-factors",children:"This is mostly related to several factors:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Stack runs on docker. Re-building the project multiple times will leave old\nimages and cache lying around, which use up many GBs of data as time goes by."}),"\n",(0,s.jsx)(n.li,{children:"The default elasticsearch settings (in es version 7.11) are set a bit tight-\npossibly trying to set a sensible default to a akin to a production setup."}),"\n"]}),"\n",(0,s.jsx)(n.h3,{id:"error-youll-see-from-the-dojo-api-or-rqworker-logs",children:"Error you'll see from the Dojo API or RQWorker logs"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:'{"error":{"root_cause":[{"type":"cluster_block_exception","reason":"index [indicators] blocked by: [TOO_MANY_REQUESTS/12/disk usage exceeded flood-stage watermark, index has read-only-allow-delete block];"}],"type":"cluster_block_exception","reason":"index [indicators] blocked by: [TOO_MANY_REQUESTS/12/disk usage exceeded flood-stage watermark, index has read-only-allow-delete block];"},"status":429}\n'})}),"\n",(0,s.jsx)(n.h3,{id:"fixes",children:"Fixes"}),"\n",(0,s.jsx)(n.p,{children:"In order to change the default disk usage %, run this query (using curl or kibana dev tools):"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:'PUT _cluster/settings\n{\n  "transient": {\n    "cluster.routing.allocation.disk.watermark.low": "100gb",\n    "cluster.routing.allocation.disk.watermark.high": "50gb",\n    "cluster.routing.allocation.disk.watermark.flood_stage": "3gb",\n    "cluster.info.update.interval": "1m"\n  }\n}\n'})}),"\n",(0,s.jsx)(n.p,{children:"In order to remove the flood-stage read-allow-delete block, run:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:'PUT /_all/_settings\n{\n  "index.blocks.read_only_allow_delete": null\n}\n'})}),"\n",(0,s.jsx)(n.p,{children:"Check your disk usage (df -H), if it has less than 3GB available, the flood stage read-only block will kick in again. Clear some disk usage, by either removing old docker containers:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"docker container prune\n"})}),"\n",(0,s.jsx)(n.p,{children:"Or/and then removing old images:"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"docker image prune -a"})}),"\n",(0,s.jsxs)(n.p,{children:["And re-run the above _settings query. Also check ",(0,s.jsx)(n.code,{children:"docker volume ls"})," to ensure there isn\u2019t too much cruft (at minimum you may have 8 items, but worse case the volume listing may contain many more items."]}),"\n",(0,s.jsx)(n.p,{children:"If you wish to really remove all of the docker disk usage lying around, except\nfor Dojo's stack and resources, run:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"  docker system prune -a\n"})}),"\n",(0,s.jsxs)(n.p,{children:["This will prompt you to confirm that anything that's related to containers that aren't running will be ",(0,s.jsx)(n.em,{children:"DELETED"}),"."]}),"\n",(0,s.jsx)(n.h2,{id:"with-kibana",children:"With Kibana"}),"\n",(0,s.jsx)(n.p,{children:"Tip- the above queries can be run with curl (change the formatting for it). Alternatively, open the kibana dev tools (started by default by our docker-compose setup):"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"http://localhost:5601/app/dev_tools#/console"})}),"\n",(0,s.jsx)(n.p,{children:"Then on the left-side editing pane paste the above queries and run them. Queries are run by placing the cursor within a request body (within the PUT/text) and clicking the play arrow on the editor-like menu."}),"\n",(0,s.jsx)(n.h2,{id:"viewing-docker-disk-usage",children:"Viewing Docker Disk Usage"}),"\n",(0,s.jsx)(n.p,{children:"To view disk usage states, you may run:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"docker system df\n"})}),"\n",(0,s.jsxs)(n.p,{children:["It will display how much is ",(0,s.jsx)(n.code,{children:"RECLAIMABLE"}),"."]}),"\n",(0,s.jsx)(n.p,{children:"Or, to get a full docker info summary"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"docker system info\n"})}),"\n",(0,s.jsx)(n.p,{children:"which will provide overall system information, including a count of images/containers which might hint on high usage on old unused data.\nTHat count usage looks like:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"Server:\n Containers: 20\n  Running: 17\n  Paused: 0\n  Stopped: 3\n Images: 31\n"})}),"\n",(0,s.jsx)(n.p,{children:"Feel free to grep a label from above to quickly find the stat you need."})]})}function h(e={}){const{wrapper:n}={...(0,r.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(c,{...e})}):c(e)}},1151:(e,n,o)=>{o.d(n,{Z:()=>l,a:()=>i});var s=o(7294);const r={},t=s.createContext(r);function i(e){const n=s.useContext(t);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:i(e.components),s.createElement(t.Provider,{value:n},e.children)}}}]);
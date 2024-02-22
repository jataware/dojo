"use strict";(self.webpackChunkdojo_docs_v_2=self.webpackChunkdojo_docs_v_2||[]).push([[968],{9523:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>r,contentTitle:()=>s,default:()=>u,frontMatter:()=>d,metadata:()=>l,toc:()=>h});var o=n(5893),i=n(1151),a=n(4285);const d={layout:"default",title:"Data Modeling",has_children:!0,has_toc:!0},s="Data Modeling",l={id:"data-modeling",title:"Data Modeling",description:"Introduction",source:"@site/docs/data-modeling.mdx",sourceDirName:".",slug:"/data-modeling",permalink:"/data-modeling",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{layout:"default",title:"Data Modeling",has_children:!0,has_toc:!0},sidebar:"dojoSidebar",previous:{title:"Preparing data for Dojo",permalink:"/data-registration/data-format"},next:{title:"Aggregation Methods",permalink:"/data-modeling/aggregation-methods"}},r={},h=[{value:"Introduction",id:"introduction",level:2},{value:"Selecting NetCDFs",id:"selecting-netcdfs",level:2},{value:"Building a Graph",id:"building-a-graph",level:2},{value:"Nodes:",id:"nodes",level:2},{value:"Load Node",id:"load-node",level:3},{value:"Threshold Node",id:"threshold-node",level:3},{value:"Join Node",id:"join-node",level:3},{value:"Filter By Country Node",id:"filter-by-country-node",level:3},{value:"Reduce By Node",id:"reduce-by-node",level:3},{value:"Scalar Operation",id:"scalar-operation",level:3},{value:"Select Slice",id:"select-slice",level:3},{value:"Mask to Distance Field",id:"mask-to-distance-field",level:3},{value:"Save Node",id:"save-node",level:3},{value:"Manual Resolution",id:"manual-resolution",level:2},{value:"Processing",id:"processing",level:2}];function c(e){const t={a:"a",admonition:"admonition",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",img:"img",li:"li",p:"p",strong:"strong",ul:"ul",...(0,i.a)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(t.h1,{id:"data-modeling",children:"Data Modeling"}),"\n",(0,o.jsx)(t.h2,{id:"introduction",children:"Introduction"}),"\n",(0,o.jsx)(t.p,{children:"With Dojo's Data Modeling tool, users can combine NetCDF datasets together through a simple visual programming interface to create new and insightful derived datasets."}),"\n",(0,o.jsx)(t.p,{children:"Relatively complex data operations and transformations can be performed on a variety of different kinds of data, no programming skills required."}),"\n",(0,o.jsx)(t.p,{children:(0,o.jsx)(t.img,{alt:"Complex Example",src:n(5337).Z+"",width:"1243",height:"1297"})}),"\n",(0,o.jsx)(t.h2,{id:"selecting-netcdfs",children:"Selecting NetCDFs"}),"\n",(0,o.jsxs)(t.p,{children:["When you initially land on the Data Modeling page, you'll be prompted to selected registered NetCDFs. If you have a NetCDF that you'd like to use that isn't yet registered in Dojo, follow the steps in ",(0,o.jsx)(t.a,{href:"./data-registration",children:"Data Registration"})," to register it. It will then appear in the list of NetCDF datasets."]}),"\n",(0,o.jsxs)(t.p,{children:["You can select as many datasets as you'd like. Once you've selected all your datasets, click ",(0,o.jsx)(t.code,{children:"USE THESE DATASETS"})," on the bottom of the page to move to the next step."]}),"\n",(0,o.jsx)(t.p,{children:(0,o.jsx)(t.img,{alt:"Select NetCDFs",src:n(4431).Z+"",width:"1312",height:"1606"})}),"\n",(0,o.jsx)(t.h2,{id:"building-a-graph",children:"Building a Graph"}),"\n",(0,o.jsx)(t.p,{children:(0,o.jsx)(t.img,{alt:"Data Modeling Graph Editor",src:n(1818).Z+"",width:"2344",height:"1670"})}),"\n",(0,o.jsx)(t.p,{children:"On the second step, you can start building out your data graph. Drag and drop nodes (explained in further detail below) from the node selection panel on the right side of the screen onto the blank canvas area on the left. Once nodes are on the canvas, they will appear with small connection points on the top and/or bottom (inputs and outputs respectively). You can click and drag between these connection points to apply operations to the data."}),"\n",(0,o.jsx)(t.p,{children:(0,o.jsx)(t.img,{alt:"Connecting Nodes",src:n(2158).Z+"",width:"1235",height:"1010"})}),"\n",(0,o.jsx)(t.p,{children:"Adding multiple nodes and creating a network of connections between them defines how input data should be transformed by the data flow graph to create the derived output data."}),"\n",(0,o.jsx)(t.h2,{id:"nodes",children:"Nodes:"}),"\n",(0,o.jsx)(a.Z,{file:"data-modeling-node-list.png",width:"300px",title:"Node List"}),"\n",(0,o.jsx)(t.h3,{id:"load-node",children:"Load Node"}),"\n",(0,o.jsx)(a.Z,{file:"data-modeling-load-node.png",title:"Load Node"}),"\n",(0,o.jsxs)(t.p,{children:["The Load Node is how data is brought into the data modeling process. Each Load Node represents ",(0,o.jsx)(t.strong,{children:"one"})," feature from a dataset. You select this feature with the ",(0,o.jsx)(t.code,{children:"Data Source"})," dropdown at the top of the node. You'll see features listed per dataset in this dropdown."]}),"\n",(0,o.jsx)(t.p,{children:"The following options in the Load Node relate to how data regridding is handled."}),"\n",(0,o.jsxs)(t.p,{children:["The first of these is a global target resolution that applies to all your features. You need to select both a geo and temporal target resolution. You can either manually hardcode these (see ",(0,o.jsx)(t.a,{href:"#manual-resolution",children:"Manual Resolution"})," below), or you can check one or both of the boxes on a Load Node to make its resolution be the target resolution. For the entire graph, you can only have one geo and one temporal target resolution, either in the Load Nodes or in the manual selectors in the sidebar."]}),"\n",(0,o.jsx)(t.p,{children:"The second is selecting regridding methods that will be used if the data in the load node needs to be regridded. These are specified with the Geo and Time Aggregation function dropdowns for each Load Node:"}),"\n",(0,o.jsxs)(t.ul,{children:["\n",(0,o.jsxs)(t.li,{children:[(0,o.jsx)(t.code,{children:"conserve"})," - maintain the total sum of the data before and after (e.g. for regridding population)"]}),"\n",(0,o.jsxs)(t.li,{children:[(0,o.jsx)(t.code,{children:"min"})," - take the minimum value from each bucket during regridding"]}),"\n",(0,o.jsxs)(t.li,{children:[(0,o.jsx)(t.code,{children:"max"})," - take the maximum value from each bucket during regridding"]}),"\n",(0,o.jsxs)(t.li,{children:[(0,o.jsx)(t.code,{children:"mean"})," - take the mean value from each bucket during regridding. ",(0,o.jsxs)(t.em,{children:["Note: Use interp_or_mean instead of ",(0,o.jsx)(t.code,{children:"mean"}),", since it doesn't handle well when increasing the resolution of the data"]})]}),"\n",(0,o.jsxs)(t.li,{children:[(0,o.jsx)(t.code,{children:"median"})," - take the median value from each bucket during regridding"]}),"\n",(0,o.jsxs)(t.li,{children:[(0,o.jsx)(t.code,{children:"mode"}),"  - take the mode of each bucket during regridding. ",(0,o.jsxs)(t.em,{children:["Note: Use nearest_or_mode instead of ",(0,o.jsx)(t.code,{children:"mode"}),", since it doesn't handle well when increasing the resolution of the data"]})]}),"\n",(0,o.jsxs)(t.li,{children:[(0,o.jsx)(t.code,{children:"interp_or_mean"}),"  - if increasing resolution, interpolate the data. If decreasing resolution, take the mean of each bucket"]}),"\n",(0,o.jsxs)(t.li,{children:[(0,o.jsx)(t.code,{children:"nearest_or_mode"}),"  - if increasing resolution, take the nearest data. if decreasing resolution, take the mode of each bucket"]}),"\n"]}),"\n",(0,o.jsx)(t.h3,{id:"threshold-node",children:"Threshold Node"}),"\n",(0,o.jsx)(a.Z,{file:"data-modeling-threshold-node.png",title:"Threshold Node"}),"\n",(0,o.jsx)(t.p,{children:"Threshold Nodes are used to select specific portions of data where some condition is true."}),"\n",(0,o.jsxs)(t.p,{children:["Take the example of a temperature dataset where you want to filter for values above a threshold temperature. A Threshold Node that takes temperature data as input and is set to ",(0,o.jsx)(t.code,{children:"greater_than"})," with the value of your threshold creates a boolean mask that is true wherever the condition was met. This can then be used to filter the original data with a ",(0,o.jsx)(t.a,{href:"#join-node",children:"Join Node"}),"."]}),"\n",(0,o.jsxs)(t.p,{children:["Threshold values can be an integer or floating point number. The type of comparison operation (",(0,o.jsx)(t.code,{children:"="}),", ",(0,o.jsx)(t.code,{children:"\u2260"}),", ",(0,o.jsx)(t.code,{children:">"}),", ",(0,o.jsx)(t.code,{children:"\u2265"}),", ",(0,o.jsx)(t.code,{children:"<"}),", ",(0,o.jsx)(t.code,{children:"\u2264"}),")  is specified with the dropdown menu."]}),"\n",(0,o.jsx)(t.h3,{id:"join-node",children:"Join Node"}),"\n",(0,o.jsx)(a.Z,{file:"data-modeling-join-node.png",title:"Join Node"}),"\n",(0,o.jsx)(t.p,{children:"Join Nodes are used to combine multiple nodes in the graph into a single dataset. Join Nodes take as input two parent nodes and output the values of those input nodes combined together. Under the hood, a Join Node multiplies the input datasets together."}),"\n",(0,o.jsxs)(t.p,{children:["The most common use case for Join Nodes is to filter data to where some condition is true. A dataset mask can be created with a ",(0,o.jsx)(t.a,{href:"#threshold-node",children:"Threshold Node"}),', and then that mask can be "joined" with the data that you want to apply the mask to.']}),"\n",(0,o.jsx)(t.p,{children:"Less commonly, depending on the particular data operations you are trying to do, it may make sense to use a Join Node to multiply two separate datasets together to get a new dataset out the other end. For example, if one dataset is gridded solar energy flux (watts/meter^2), and another dataset is solar panel area (meter^2) per each lat/lon point, you could multiply them together with a Join Node to get a new dataset that is the expected power production per each lat/lon grid point."}),"\n",(0,o.jsx)(t.h3,{id:"filter-by-country-node",children:"Filter By Country Node"}),"\n",(0,o.jsx)(a.Z,{file:"data-modeling-filter-by-country-node.png",title:"Filter By Country Node"}),"\n",(0,o.jsxs)(t.p,{children:["With this node, you can filter the data coming out of your selected features by the countries you select in the dropdown. You can select multiple countries. The output dataset will be a copy of the input dataset, but with an extra ",(0,o.jsx)(t.code,{children:"admin0"})," (i.e. country) dimension. Every country specified in the Filter By Country Node will be split into its own separate layer along the country dimension of the output. All other values not within the bounds of any of the specified countries will be set to ",(0,o.jsx)(t.code,{children:"0"})]}),"\n",(0,o.jsx)(t.h3,{id:"reduce-by-node",children:"Reduce By Node"}),"\n",(0,o.jsx)(a.Z,{file:"data-modeling-reduce-by-node.png",title:"Reduce By Node"}),"\n",(0,o.jsxs)(t.p,{children:["This node can be used to aggregate a dataset across one or more dimensions. The input dataset will be ",(0,o.jsx)(t.code,{children:"sum-reduced"})," along the dimensions specified by the checkboxes. For example, say you have monthly population data gridded to ",(0,o.jsx)(t.code,{children:"0.1x0.1"})," lat/lon, and you would like to produce a single population curve over time. Using the Reduce By Node, selecting ",(0,o.jsx)(t.code,{children:"lat"})," and ",(0,o.jsx)(t.code,{children:"lon"})," will sum up all of the values for each time slice in the input dataset, and produce a new dataset that is just a single aggregated curve over time."]}),"\n",(0,o.jsx)(t.admonition,{type:"tip",children:(0,o.jsxs)(t.p,{children:["At present, Reduce By Nodes are hardcoded with the options ",(0,o.jsx)(t.code,{children:"lat"}),", ",(0,o.jsx)(t.code,{children:"lon"}),", ",(0,o.jsx)(t.code,{children:"time"}),", and ",(0,o.jsx)(t.code,{children:"country"}),", regardless of what dimensions your data has. Take care to only select dimensions that already exist on your dataset."]})}),"\n",(0,o.jsx)(t.h3,{id:"scalar-operation",children:"Scalar Operation"}),"\n",(0,o.jsx)(a.Z,{file:"data-modeling-scalar-operation-node.png",width:"250px",title:"Scalar Operation Node"}),"\n",(0,o.jsx)(t.admonition,{type:"note",children:(0,o.jsx)(t.p,{children:"The documentation for this node is in progress..."})}),"\n",(0,o.jsx)(t.h3,{id:"select-slice",children:"Select Slice"}),"\n",(0,o.jsx)(t.admonition,{type:"note",children:(0,o.jsx)(t.p,{children:"The documentation for this node is in progress..."})}),"\n",(0,o.jsx)(t.h3,{id:"mask-to-distance-field",children:"Mask to Distance Field"}),"\n",(0,o.jsx)(a.Z,{file:"data-modeling-mask-to-distance-field-node.png",width:"250px",title:"Mask to Distance Field Node"}),"\n",(0,o.jsx)(t.p,{children:"data-modeling-mask-to-distance-field-node.png"}),"\n",(0,o.jsx)(t.admonition,{type:"note",children:(0,o.jsx)(t.p,{children:"The documentation for this node is in progress..."})}),"\n",(0,o.jsx)(t.h3,{id:"save-node",children:"Save Node"}),"\n",(0,o.jsx)(a.Z,{file:"data-modeling-save-node.png",title:"Save Node"}),"\n",(0,o.jsx)(t.p,{children:"The final step in a graph is adding a Save Node. The Save Node has input text fields for both name and description, which will be used to label the output dataset and save it back into Dojo as a new derived dataset."}),"\n",(0,o.jsx)(t.h2,{id:"manual-resolution",children:"Manual Resolution"}),"\n",(0,o.jsx)(a.Z,{file:"data-modeling-manual-resolution.png",title:"Manual Resolution"}),"\n",(0,o.jsxs)(t.p,{children:["Below the list of nodes on the right side of the screen, you'll find two inputs where you can manually set your Geo and/or Time Resolution. You can use these instead of selecting one of your ",(0,o.jsx)(t.code,{children:"Load Node"})," features to be Geo/Time Resolution if you want to set the resolution by hand. If you set it here, you won't be able to select any of the same type of resolution elsewhere until you clear it."]}),"\n",(0,o.jsx)(t.admonition,{type:"tip",children:(0,o.jsxs)(t.p,{children:["Selecting both a Geo and a Temporal Resolution is required before you can ",(0,o.jsx)(t.a,{href:"#processing",children:"process"})," your graph. These can be set manually in the sidebar, in the Load Nodes, or one of each."]})}),"\n",(0,o.jsx)(t.h2,{id:"processing",children:"Processing"}),"\n",(0,o.jsxs)(t.p,{children:["Once you're done setting up your graph, click the ",(0,o.jsx)(t.code,{children:"PROCESS"})," button to start running the backend process. When it's complete, you'll see a list of the datasets that the process output."]}),"\n",(0,o.jsx)(t.admonition,{type:"tip",children:(0,o.jsx)(t.p,{children:"It is important to make sure you have at least one Load Node with a feature selected. Also ensure that all the nodes in your graph are connected before hitting process."})})]})}function u(e={}){const{wrapper:t}={...(0,i.a)(),...e.components};return t?(0,o.jsx)(t,{...e,children:(0,o.jsx)(c,{...e})}):c(e)}},4285:(e,t,n)=>{n.d(t,{Z:()=>a});n(7294);var o=n(4996),i=n(5893);function a(e){let{width:t,file:n,title:a}=e;return(0,i.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center"},children:[(0,i.jsx)("img",{src:(0,o.Z)(`/img/${n}`),width:t,alt:a}),(0,i.jsx)("p",{children:(0,i.jsx)("i",{children:a})})]})}},5337:(e,t,n)=>{n.d(t,{Z:()=>o});const o=n.p+"assets/images/data-modeling-complex-example-bb64070e5d392373a8b191230a5c92e0.png"},2158:(e,t,n)=>{n.d(t,{Z:()=>o});const o=n.p+"assets/images/data-modeling-connecting-nodes-0fe60178e19b6a5b201b01f84db37c33.png"},1818:(e,t,n)=>{n.d(t,{Z:()=>o});const o=n.p+"assets/images/data-modeling-empty-canvas-9f1eb0413c293ede6d17f52689721535.png"},4431:(e,t,n)=>{n.d(t,{Z:()=>o});const o=n.p+"assets/images/data-modeling-select-netcdfs-19e59e4d3bf225303a2511a1d880fbd9.png"},1151:(e,t,n)=>{n.d(t,{Z:()=>s,a:()=>d});var o=n(7294);const i={},a=o.createContext(i);function d(e){const t=o.useContext(a);return o.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function s(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:d(e.components),o.createElement(a.Provider,{value:t},e.children)}}}]);
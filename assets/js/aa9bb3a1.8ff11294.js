"use strict";(self.webpackChunkdojo_docs_v_2=self.webpackChunkdojo_docs_v_2||[]).push([[997],{7651:(e,o,i)=>{i.r(o),i.d(o,{assets:()=>r,contentTitle:()=>a,default:()=>h,frontMatter:()=>l,metadata:()=>s,toc:()=>d});var n=i(5893),t=i(1151);const l={layout:"default",title:"Uploading Large Files",parent:"Model Registration"},a="Uploading Large Files",s={id:"model-registration/large-files",title:"Uploading Large Files",description:"Some models may require uploading large files into the containerization environment. To do this, we provide access to Amazon Web Service's Simple Cloud Storage (AWS S3). Accessing the Dojo S3 is easy, but it does require an AWS access key and secret key. Please reach out to dojo@jataware.com to request access.",source:"@site/docs/model-registration/large-files.md",sourceDirName:"model-registration",slug:"/model-registration/large-files",permalink:"/dojo/model-registration/large-files",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{layout:"default",title:"Uploading Large Files",parent:"Model Registration"},sidebar:"dojoSidebar",previous:{title:"Prebuilt Containers",permalink:"/dojo/model-registration/docker"},next:{title:"Data Registration",permalink:"/dojo/data-registration"}},r={},d=[{value:"Uploading files with the AWS CLI",id:"uploading-files-with-the-aws-cli",level:2},{value:"Uploading files with <code>boto3</code>",id:"uploading-files-with-boto3",level:2},{value:"Downloading your large file",id:"downloading-your-large-file",level:2}];function c(e){const o={a:"a",admonition:"admonition",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",...(0,t.a)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(o.h1,{id:"uploading-large-files",children:"Uploading Large Files"}),"\n",(0,n.jsxs)(o.p,{children:["Some models may require uploading large files into the containerization environment. To do this, we provide access to Amazon Web Service's Simple Cloud Storage (AWS S3). Accessing the Dojo S3 is easy, but it does require an AWS access key and secret key. Please reach out to ",(0,n.jsx)(o.a,{href:"mailto:dojo@jataware.com",children:"dojo@jataware.com"})," to request access."]}),"\n",(0,n.jsx)(o.p,{children:"There are numerous ways to upload files to S3. We will describe below the two most common methods:"}),"\n",(0,n.jsxs)(o.ol,{children:["\n",(0,n.jsx)(o.li,{children:"Using the AWS CLI"}),"\n",(0,n.jsxs)(o.li,{children:["Using the Python ",(0,n.jsx)(o.code,{children:"boto3"})," library"]}),"\n"]}),"\n",(0,n.jsxs)(o.blockquote,{children:["\n",(0,n.jsxs)(o.p,{children:[(0,n.jsx)(o.strong,{children:"WARNING"}),": leaking your Dojo AWS credentials to the public may cause your access to Dojo to be revoked!"]}),"\n"]}),"\n",(0,n.jsx)(o.h2,{id:"uploading-files-with-the-aws-cli",children:"Uploading files with the AWS CLI"}),"\n",(0,n.jsxs)(o.p,{children:["First, you'll need to download and install the ",(0,n.jsx)(o.a,{href:"https://aws.amazon.com/cli/",children:"AWS CLI"}),". Next, in a terminal, type ",(0,n.jsx)(o.code,{children:"aws configure"}),". You should be prompted for the AWS access key and secret key provided to you by the Dojo team."]}),"\n",(0,n.jsxs)(o.p,{children:["If you are already using the AWS CLI you should consider adding a ",(0,n.jsx)(o.a,{href:"https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html",children:"named profile"})," called ",(0,n.jsx)(o.code,{children:"dojo-modeling"}),"."]}),"\n",(0,n.jsx)(o.p,{children:"Now, to upload a file you can run:"}),"\n",(0,n.jsx)(o.pre,{children:(0,n.jsx)(o.code,{children:"aws s3 cp my_large_file.csv s3://dojo-modeling-data/\n"})}),"\n",(0,n.jsxs)(o.p,{children:["If you have created an AWS profile locally you may append ",(0,n.jsx)(o.code,{children:" --profile=dojo-modeling"})," to the above command. Once you've received confirmation that the file is uploaded, it will be available ",(0,n.jsx)(o.strong,{children:"to the public"})," at:"]}),"\n",(0,n.jsx)(o.pre,{children:(0,n.jsx)(o.code,{children:"https://dojo-modeling-data.s3.amazonaws.com/my_large_file.csv\n"})}),"\n",(0,n.jsx)(o.admonition,{type:"warning",children:(0,n.jsxs)(o.p,{children:["All files uploaded to the ",(0,n.jsx)(o.code,{children:"dojo-modeling-data"})," S3 bucket are public by default."]})}),"\n",(0,n.jsxs)(o.h2,{id:"uploading-files-with-boto3",children:["Uploading files with ",(0,n.jsx)(o.code,{children:"boto3"})]}),"\n",(0,n.jsxs)(o.p,{children:["If you are a Python user, you may wish to upload large files using Python's ",(0,n.jsx)(o.code,{children:"boto3"})," library. First install it with ",(0,n.jsx)(o.code,{children:"pip3 install boto3"}),". Then, in a Python terminal run:"]}),"\n",(0,n.jsx)(o.pre,{children:(0,n.jsx)(o.code,{children:"import boto3\n\ns3_client = boto3.client(\n    's3',\n    aws_access_key_id='YOUR_ACCESS_KEY',\n    aws_secret_access_key='YOUR_SECRET_KEY',\n)\n\ns3_client.upload_file('my_large_file.csv','dojo-modeling-data','my_large_file.csv')\n"})}),"\n",(0,n.jsxs)(o.p,{children:["You should now be able to download the file from ",(0,n.jsx)(o.code,{children:"https://dojo-modeling-data.s3.amazonaws.com/my_large_file.csv"}),"."]}),"\n",(0,n.jsx)(o.h2,{id:"downloading-your-large-file",children:"Downloading your large file"}),"\n",(0,n.jsxs)(o.p,{children:["You may download your large file from the containerization environment using ",(0,n.jsx)(o.code,{children:"wget"}),":"]}),"\n",(0,n.jsx)(o.pre,{children:(0,n.jsx)(o.code,{children:"wget https://dojo-modeling-data.s3.amazonaws.com/my_large_file.csv\n"})})]})}function h(e={}){const{wrapper:o}={...(0,t.a)(),...e.components};return o?(0,n.jsx)(o,{...e,children:(0,n.jsx)(c,{...e})}):c(e)}},1151:(e,o,i)=>{i.d(o,{Z:()=>s,a:()=>a});var n=i(7294);const t={},l=n.createContext(t);function a(e){const o=n.useContext(l);return n.useMemo((function(){return"function"==typeof e?e(o):{...o,...e}}),[o,e])}function s(e){let o;return o=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:a(e.components),n.createElement(l.Provider,{value:o},e.children)}}}]);
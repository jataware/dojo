"use strict";(self.webpackChunkdojo_docs_v_2=self.webpackChunkdojo_docs_v_2||[]).push([[53],{1109:e=>{e.exports=JSON.parse('{"pluginId":"default","version":"current","label":"Next","banner":null,"badge":false,"noIndex":false,"className":"docs-version-current","isLast":true,"docsSidebars":{"dojoSidebar":[{"type":"link","label":"Intro to Dojo","href":"/","docId":"index","unlisted":false},{"type":"category","label":"Video How-tos","items":[{"type":"link","label":"Model Registration","href":"/video-howtos/model-registration","docId":"video-howtos/model-registration","unlisted":false},{"type":"link","label":"Dataset Registration","href":"/video-howtos/data-registration","docId":"video-howtos/data-registration","unlisted":false},{"type":"link","label":"Data Modeling","href":"/video-howtos/data-modeling","docId":"video-howtos/data-modeling","unlisted":false},{"type":"link","label":"Documents and Knowledge","href":"/video-howtos/documents-knowledge","docId":"video-howtos/documents-knowledge","unlisted":false}],"collapsed":true,"collapsible":true},{"type":"category","label":"Model Registration","items":[{"type":"link","label":"Cheatsheet","href":"/model-registration/cheatsheet","docId":"model-registration/cheatsheet","unlisted":false},{"type":"link","label":"Excel Models","href":"/model-registration/excel","docId":"model-registration/excel","unlisted":false},{"type":"link","label":"Jupyter Notebooks","href":"/model-registration/jupyter","docId":"model-registration/jupyter","unlisted":false},{"type":"link","label":"MATLAB Models","href":"/model-registration/matlab","docId":"model-registration/matlab","unlisted":false},{"type":"link","label":"Prebuilt Containers","href":"/model-registration/docker","docId":"model-registration/docker","unlisted":false},{"type":"link","label":"Uploading Large Files","href":"/model-registration/large-files","docId":"model-registration/large-files","unlisted":false}],"collapsed":true,"collapsible":true,"href":"/model-registration"},{"type":"category","label":"Data Registration","items":[{"type":"link","label":"Geotemporal Format","href":"/data-registration/geotemporal-format","docId":"data-registration/geotemporal-format","unlisted":false},{"type":"link","label":"Preparing Data for Dojo","href":"/data-registration/data-format","docId":"data-registration/data-format","unlisted":false}],"collapsed":true,"collapsible":true,"href":"/data-registration"},{"type":"category","label":"Data Modeling","items":[{"type":"link","label":"Aggregation Methods","href":"/data-modeling/aggregation-methods","docId":"data-modeling/aggregation-methods","unlisted":false}],"collapsed":true,"collapsible":true,"href":"/data-modeling"},{"type":"link","label":"Dojo API","href":"/dojo-api","docId":"dojo-api","unlisted":false},{"type":"link","label":"Documents","href":"/documents","docId":"documents","unlisted":false},{"type":"category","label":"Model Execution","items":[{"type":"link","label":"Dojo CLI Commands","href":"/model-execution/dojo-cli","docId":"model-execution/dojo-cli","unlisted":false}],"collapsed":true,"collapsible":true,"href":"/model-execution"},{"type":"link","label":"Frequently Asked Questions","href":"/FAQ","docId":"FAQ","unlisted":false},{"type":"category","label":"Developer Documentation","items":[{"type":"link","label":"Stack Overview","href":"/dev-docs/stack-overview","docId":"dev-docs/stack-overview","unlisted":false},{"type":"link","label":"Environment Setup","href":"/dev-docs/environment-setup","docId":"dev-docs/environment-setup","unlisted":false},{"type":"link","label":"Developer Workflow","href":"/dev-docs/developer-workflow","docId":"dev-docs/developer-workflow","unlisted":false},{"type":"link","label":"Make and Docker Integration","href":"/dev-docs/make-and-docker-integration","docId":"dev-docs/make-and-docker-integration","unlisted":false},{"type":"link","label":"Document Upload Architecture","href":"/dev-docs/document-upload-architecture","docId":"dev-docs/document-upload-architecture","unlisted":false},{"type":"link","label":"Knowledge UI","href":"/dev-docs/knowledge-ui","docId":"dev-docs/knowledge-ui","unlisted":false},{"type":"link","label":"Production Deployment","href":"/dev-docs/production-deployment","docId":"dev-docs/production-deployment","unlisted":false},{"type":"link","label":"Common Problems","href":"/dev-docs/common-problems","docId":"dev-docs/common-problems","unlisted":false},{"type":"link","label":"Whitelabeling","href":"/dev-docs/whitelabeling","docId":"dev-docs/whitelabeling","unlisted":false}],"collapsed":true,"collapsible":true,"href":"/dev-docs"}]},"docs":{"ai-assistant":{"id":"ai-assistant","title":"AI Assistant","description":""},"data-modeling":{"id":"data-modeling","title":"Data Modeling","description":"Introduction","sidebar":"dojoSidebar"},"data-modeling/aggregation-methods":{"id":"data-modeling/aggregation-methods","title":"Aggregation Methods","description":"In the Data Modeling Load Nodes, regridding methods need to be selected if the data is going to be geographically and/or temporally regridded. This is the list of options available in both the Geo and Time Aggregation dropdowns:","sidebar":"dojoSidebar"},"data-registration":{"id":"data-registration","title":"Data Registration","description":"Getting started","sidebar":"dojoSidebar"},"data-registration/data-format":{"id":"data-registration/data-format","title":"Preparing data for Dojo","description":"Dojo can accept CSV, Excel, GeoTIFF and NetCDF files. When you initially upload a file you may be presented with a set of options depending upon the detected file type. Dojo is not a data cleaning platform; your data should be clean prior to registering it to Dojo.","sidebar":"dojoSidebar"},"data-registration/geotemporal-format":{"id":"data-registration/geotemporal-format","title":"Geotemporal Format","description":"Geotemporal Format","sidebar":"dojoSidebar"},"dev-docs":{"id":"dev-docs","title":"Developer Docs","description":"This wiki is a developer guide for working with the Dojo Stack.","sidebar":"dojoSidebar"},"dev-docs/common-problems":{"id":"dev-docs/common-problems","title":"Common Problems","description":"ElasticSearch Host Out of Disk Space","sidebar":"dojoSidebar"},"dev-docs/developer-workflow":{"id":"dev-docs/developer-workflow","title":"Developer Workflow","description":"Or, A Day in The Life of Dojo Developer","sidebar":"dojoSidebar"},"dev-docs/document-upload-architecture":{"id":"dev-docs/document-upload-architecture","title":"Document Upload Architecture","description":"Sequence Diagram with NOS_OCR","sidebar":"dojoSidebar"},"dev-docs/environment-setup":{"id":"dev-docs/environment-setup","title":"Environment Setup","description":"This page details how to configure the dojo-stack environment file","sidebar":"dojoSidebar"},"dev-docs/knowledge-ui":{"id":"dev-docs/knowledge-ui","title":"Knowledge AI","description":"Dojo has support to upload, manage, search, and analyze document contents using","sidebar":"dojoSidebar"},"dev-docs/make-and-docker-integration":{"id":"dev-docs/make-and-docker-integration","title":"Make and Docker Integration","description":"Developers familiar with Docker and docker-compose might be surprised to find that the docker-compose.yaml file at the root of the repo is programmatically generated and updated","sidebar":"dojoSidebar"},"dev-docs/production-deployment":{"id":"dev-docs/production-deployment","title":"Production Deployment","description":"This article is in the process of being written. Please check back here soon or contact Jataware for more information.","sidebar":"dojoSidebar"},"dev-docs/stack-overview":{"id":"dev-docs/stack-overview","title":"Stack Overview","description":"Diagram of stack","sidebar":"dojoSidebar"},"dev-docs/whitelabeling":{"id":"dev-docs/whitelabeling","title":"Whitelabeling","description":"The Dojo app can be whitelabeled (rebranded) with custom text, styles, and components through a set of utility tools in the ui React app. This process currently involves light front end coding, though once it is configured for a specific organization, making changes to the copy or styles is easy and fast.","sidebar":"dojoSidebar"},"documents":{"id":"documents","title":"Documents","description":"Document Uploader","sidebar":"dojoSidebar"},"dojo-api":{"id":"dojo-api","title":"Dojo API","description":"This document outlines how to interact with the Dojo API to fetch models, execute models, and fetch model runs.","sidebar":"dojoSidebar"},"FAQ":{"id":"FAQ","title":"Frequently Asked Questions","description":"1. Will my model be a good fit for running in Dojo?","sidebar":"dojoSidebar"},"index":{"id":"index","title":"Intro to Dojo","description":"The Dojo Docs are in the process of being updated. Some pages and screenshots may be out of date while we bring them up to speed. Please contact Jataware with any questions that aren\'t answered here.","sidebar":"dojoSidebar"},"model-execution":{"id":"model-execution","title":"Model Execution","description":"Dojo offers both a command-line interface library and web interface solution for black box domain model execution.","sidebar":"dojoSidebar"},"model-execution/dojo-cli":{"id":"model-execution/dojo-cli","title":"CLI Commands","description":"The Dojo CLI is a tool to use outside the Dojo ecosystem to execute Dojo models. You can install it anywhere Docker is installed and execute all models registered to Dojo with custom parameters. It\'s commands are:","sidebar":"dojoSidebar"},"model-registration":{"id":"model-registration","title":"Model Registration","description":"Overview","sidebar":"dojoSidebar"},"model-registration/cheatsheet":{"id":"model-registration/cheatsheet","title":"Cheatsheet","description":"There are a handful of Dojo specific commands that you must use inside the Dojo containerization environment/terminal emulator to successfully register your model.","sidebar":"dojoSidebar"},"model-registration/docker":{"id":"model-registration/docker","title":"Prebuilt Containers","description":"Dojo supports the usage of prebuilt containers that are hosted on Dockerhub. However, Dojo currently only supports Debian based images such as Ubuntu. A (somewhat) complete listing of Debian derivatives can be found at the Debian Census.","sidebar":"dojoSidebar"},"model-registration/excel":{"id":"model-registration/excel","title":"Excel Models","description":"To aid in running models written in Excel, Dojo has a helper tool that allows for the execution of .xlsx files with the ability to define dynamic parameters. Since models must be executable via the command line to be registered to Dojo, this allows modelers with Excel based models to register them into Dojo.","sidebar":"dojoSidebar"},"model-registration/jupyter":{"id":"model-registration/jupyter","title":"Jupyter Notebooks","description":"To register a Jupyter notebook based model in Dojo we recommend installing Papermill to run the model. Papermill allows the ability to run a notebook as an executable as well as tag and expose parameters, which might be needed depending on how model parameters are defined.","sidebar":"dojoSidebar"},"model-registration/large-files":{"id":"model-registration/large-files","title":"Uploading Large Files","description":"Some models may require uploading large files into the containerization environment. To do this, we provide access to Amazon Web Service\'s Simple Cloud Storage (AWS S3). Accessing the Dojo S3 is easy, but it does require an AWS access key and secret key. Please reach out to dojo@jataware.com to request access.","sidebar":"dojoSidebar"},"model-registration/matlab":{"id":"model-registration/matlab","title":"MATLAB Models","description":"MATLAB is a proprietary software that requires a license to use. This presents a challenge to registering models into an environment where there is no software license for MATLAB. Conveniently, MATALB offers the option to compile model code into an executable that can be run using the MATLAB Runtime. MATLAB Runtime does not reqiure a MATLAB software license. To register a MATLAB model to Dojo it must first be compiled, then executed using the Runtime.","sidebar":"dojoSidebar"},"video-howtos/data-modeling":{"id":"video-howtos/data-modeling","title":"Data Modeling Video Tutorial","description":"Case Studies","sidebar":"dojoSidebar"},"video-howtos/data-registration":{"id":"video-howtos/data-registration","title":"Dataset Registration","description":"In this video series we walk through registering and transforming datasets in Dojo.","sidebar":"dojoSidebar"},"video-howtos/documents-knowledge":{"id":"video-howtos/documents-knowledge","title":"Documents and Knowledge Video Tutorial","description":"In this video series we walk through knowledge management in Dojo.","sidebar":"dojoSidebar"},"video-howtos/model-registration":{"id":"video-howtos/model-registration","title":"Model Registration Video Tutorial","description":"Overview","sidebar":"dojoSidebar"}}}')}}]);
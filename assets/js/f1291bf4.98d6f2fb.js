"use strict";(self.webpackChunkdojo_docs_v_2=self.webpackChunkdojo_docs_v_2||[]).push([[587],{5751:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>a,contentTitle:()=>r,default:()=>m,frontMatter:()=>s,metadata:()=>t,toc:()=>c});var d=i(5893),o=i(1151),l=i(4285);const s={layout:"default",title:"Model Execution",has_children:!0,has_toc:!0},r="Model Execution",t={id:"model-execution",title:"Model Execution",description:"Dojo offers both a command-line interface library and web interface solution for black box domain model execution.",source:"@site/docs/model-execution.mdx",sourceDirName:".",slug:"/model-execution",permalink:"/dojo/model-execution",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{layout:"default",title:"Model Execution",has_children:!0,has_toc:!0},sidebar:"dojoSidebar",previous:{title:"Documents",permalink:"/dojo/documents"},next:{title:"CLI Commands",permalink:"/dojo/model-execution/dojo-cli"}},a={},c=[{value:"Quick Execution through Browser",id:"quick-execution-through-browser",level:2},{value:"CLI Components",id:"cli-components",level:2},{value:"Installation",id:"installation",level:2},{value:"Running models attached vs. detached",id:"running-models-attached-vs-detached",level:2},{value:"Setup",id:"setup",level:2},{value:"CLI help",id:"cli-help",level:2},{value:"Available commands",id:"available-commands",level:2},{value:"<em>describe</em>",id:"describe",level:2},{value:"Parameters",id:"parameters",level:3},{value:"Example",id:"example",level:3},{value:"<em>listmodels</em>",id:"listmodels",level:2},{value:"Description",id:"description",level:3},{value:"Parameters",id:"parameters-1",level:3},{value:"Example",id:"example-1",level:3},{value:"<em>outputs</em>",id:"outputs",level:2},{value:"Description",id:"description-1",level:3},{value:"Parameters",id:"parameters-2",level:3},{value:"Example",id:"example-2",level:3},{value:"<em>parameters</em>",id:"parameters-3",level:2},{value:"Description",id:"description-2",level:3},{value:"Parameters",id:"parameters-4",level:3},{value:"Example",id:"example-3",level:3},{value:"<em>results</em>",id:"results",level:2},{value:"Description",id:"description-3",level:3},{value:"Parameters",id:"parameters-5",level:3},{value:"Examples",id:"examples",level:3},{value:"<em>runmodel</em>",id:"runmodel",level:2},{value:"Description",id:"description-4",level:3},{value:"Parameters",id:"parameters-6",level:3},{value:"Examples",id:"examples-1",level:3},{value:"Models missing Docker images",id:"models-missing-docker-images",level:3},{value:"<em>versions</em>",id:"versions",level:2},{value:"Description",id:"description-5",level:3},{value:"Parameters",id:"parameters-7",level:3},{value:"Example",id:"example-4",level:3}];function h(e){const n={a:"a",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,o.a)(),...e.components};return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(n.h1,{id:"model-execution",children:"Model Execution"}),"\n",(0,d.jsx)(n.p,{children:"Dojo offers both a command-line interface library and web interface solution for black box domain model execution."}),"\n",(0,d.jsx)(n.h2,{id:"quick-execution-through-browser",children:"Quick Execution through Browser"}),"\n",(0,d.jsxs)(n.p,{children:["To start a run, navigate to the summary page for the model and select the ",(0,d.jsx)(n.strong,{children:"Create Model Run"})," button.\nA form pre-populated with the default parameters will pop up. After you have made the desired modifications\nto the parameters, the model run can be submitted with the button on the bottom left."]}),"\n",(0,d.jsx)(l.Z,{file:"model-run-form.png",title:"Create Run"}),"\n",(0,d.jsx)(n.h2,{id:"cli-components",children:"CLI Components"}),"\n",(0,d.jsx)(n.p,{children:"This library enables users to execute domain models locally."}),"\n",(0,d.jsx)(n.p,{children:"The library has 7 key methods:"}),"\n",(0,d.jsxs)(n.ul,{children:["\n",(0,d.jsx)(n.li,{children:"List the latest versions of all available models."}),"\n",(0,d.jsx)(n.li,{children:"Print parameter metadata for a selected model."}),"\n",(0,d.jsx)(n.li,{children:"Print a summary of the output and accessory files of a selected model."}),"\n",(0,d.jsx)(n.li,{children:"Print a desription of a selected model."}),"\n",(0,d.jsx)(n.li,{children:"Get the results of a detached model run that has finished."}),"\n",(0,d.jsx)(n.li,{children:"Run a model."}),"\n",(0,d.jsx)(n.li,{children:"List all versions of a model."}),"\n"]}),"\n",(0,d.jsx)(n.h2,{id:"installation",children:"Installation"}),"\n",(0,d.jsxs)(n.p,{children:["Ensure you have a working installation of ",(0,d.jsx)(n.a,{href:"https://docs.docker.com/engine/install/",children:"Docker"}),"."]}),"\n",(0,d.jsx)(n.p,{children:"Once Docker is installed on Linux or Mac you can add the current user to the Docker group with:"}),"\n",(0,d.jsx)(n.pre,{children:(0,d.jsx)(n.code,{children:"sudo groupadd docker\nsudo gpasswd -a $USER docker\n"})}),"\n",(0,d.jsx)(n.p,{children:"then log out/back in so changes can take effect. This should be done after installing Docker."}),"\n",(0,d.jsxs)(n.p,{children:["Dojo-cli can be installed via ",(0,d.jsx)(n.code,{children:"pip"}),":"]}),"\n",(0,d.jsx)(n.pre,{children:(0,d.jsx)(n.code,{children:"pip install dojo-cli\n"})}),"\n",(0,d.jsx)(n.h2,{id:"running-models-attached-vs-detached",children:"Running models attached vs. detached"}),"\n",(0,d.jsxs)(n.p,{children:["By default the ",(0,d.jsx)(n.code,{children:"runmodel"})," command runs the model attached, which means ",(0,d.jsx)(n.strong,{children:"dojo"})," waits for processing to finish before returning control to the command line. For models that take a long time to process, the ",(0,d.jsx)(n.code,{children:"--attached=False"})," parameter can be used with ",(0,d.jsx)(n.a,{href:"#runmodel",children:"runmodel"})," to run the model in background, and ",(0,d.jsx)(n.a,{href:"#results",children:"results"})," used to check for model run completion."]}),"\n",(0,d.jsx)(n.h2,{id:"setup",children:"Setup"}),"\n",(0,d.jsxs)(n.p,{children:["The CLI requires a configuration file with ",(0,d.jsx)(n.a,{href:"https://github.com/dojo-modeling",children:"DOJO API"})," credentials. This filename can be passed with each CLI command via the ",(0,d.jsx)(n.code,{children:"--config"})," option, or the default file ",(0,d.jsx)(n.em,{children:".config"})," will be used."]}),"\n",(0,d.jsxs)(n.p,{children:["See ",(0,d.jsx)(n.em,{children:"example.config"})," for guidance:"]}),"\n",(0,d.jsx)(n.pre,{children:(0,d.jsx)(n.code,{children:'{\n    "DOJO_URL": "https://dojo-test.com",\n    "DOJO_USER": "",\n    "DOJO_PWD": ""\n}\n'})}),"\n",(0,d.jsx)(n.p,{children:"If running the library locally from source, the following libraries are required to be installed:"}),"\n",(0,d.jsx)(n.pre,{children:(0,d.jsx)(n.code,{children:"Click>=7.0,<8\ndocker>=5.0.3\nJinja2>=2.11.3\n"})}),"\n",(0,d.jsx)(n.h2,{id:"cli-help",children:"CLI help"}),"\n",(0,d.jsx)(n.p,{children:"The following commands will provide details of each available dojo command:"}),"\n",(0,d.jsx)(n.pre,{children:(0,d.jsx)(n.code,{children:"dojo --help\ndojo describe --help\ndojo listmodels --help\ndojo outputs --help\ndojo parameters --help\ndojo results --help\ndojo runmodel --help\ndojo versions --help\n"})}),"\n",(0,d.jsx)(n.h2,{id:"available-commands",children:"Available commands"}),"\n",(0,d.jsxs)(n.ul,{children:["\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.a,{href:"#describe",children:"describe"}),": Print a description of the model."]}),"\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.a,{href:"#listmodels",children:"listmodels"}),": List available models."]}),"\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.a,{href:"#outputs",children:"outputs"}),": Print descriptions of the output and accessory files produced by a model."]}),"\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.a,{href:"#parameters",children:"parameters"}),": Print the parameters required to run a model."]}),"\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.a,{href:"#results",children:"results"}),": Get the results of a model finished running detached."]}),"\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.a,{href:"#runmodel",children:"runmodel"}),": Run a model."]}),"\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.a,{href:"#versions",children:"versions"}),": List all versions of a model."]}),"\n"]}),"\n",(0,d.jsx)(n.h2,{id:"describe",children:(0,d.jsx)(n.em,{children:"describe"})}),"\n",(0,d.jsx)(n.p,{children:"Print a description of the model."}),"\n",(0,d.jsx)(n.h3,{id:"parameters",children:"Parameters"}),"\n",(0,d.jsxs)(n.ul,{children:["\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"--model"})," : name of the model"]}),"\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"--config"})," : name of configuation file; defaults to ",(0,d.jsx)(n.em,{children:".config"})]}),"\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"--version"})," : version of the model if ",(0,d.jsx)(n.code,{children:"--model"})," is not passed"]}),"\n"]}),"\n",(0,d.jsx)(n.h3,{id:"example",children:"Example"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:'dojo describe --model="Population Model"'})}),"\n",(0,d.jsx)(n.pre,{children:(0,d.jsx)(n.code,{children:"NAME\n----\nPopulation Model\n\nMODEL FAMILY\n------------\nKimetrica\n\nDESCRIPTION\n-----------\nThe population model serves as an ancillary tool to distribute, disaggregate yearly population projections onto a geospatial representation. Occasionally, the output of this model is required as an independent variable for downstream models.y\n...\n"})}),"\n",(0,d.jsx)(n.h2,{id:"listmodels",children:(0,d.jsx)(n.em,{children:"listmodels"})}),"\n",(0,d.jsx)(n.h3,{id:"description",children:"Description"}),"\n",(0,d.jsx)(n.p,{children:"List available models."}),"\n",(0,d.jsx)(n.h3,{id:"parameters-1",children:"Parameters"}),"\n",(0,d.jsxs)(n.ul,{children:["\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"--config"})," : name of configuation file; defaults to ",(0,d.jsx)(n.em,{children:".config"})]}),"\n"]}),"\n",(0,d.jsx)(n.h3,{id:"example-1",children:"Example"}),"\n",(0,d.jsxs)(n.p,{children:["$ ",(0,d.jsx)(n.code,{children:"dojo listmodels"})]}),"\n",(0,d.jsx)(n.pre,{children:(0,d.jsx)(n.code,{children:"(1) APSIM\n(2) APSIM-Cropping\n(3) APSIM-Rangelands\n(4) Accessibility Model\n(5) AgMIP Seasonal Crop Emulator\n(6) CHIRPS - Climate Hazards Center Infrared Precipitation with Stations\n(7) CHIRPS-GEFS\n(8) CHIRPS-GEFS Monthly\n(9) CHIRPS-Monthly\n...\n"})}),"\n",(0,d.jsx)(n.h2,{id:"outputs",children:(0,d.jsx)(n.em,{children:"outputs"})}),"\n",(0,d.jsx)(n.h3,{id:"description-1",children:"Description"}),"\n",(0,d.jsx)(n.p,{children:"Prints a summary of the output and accessory files produced by a model."}),"\n",(0,d.jsx)(n.h3,{id:"parameters-2",children:"Parameters"}),"\n",(0,d.jsxs)(n.ul,{children:["\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"--model"})," : name of the model"]}),"\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"--config"})," : name of configuation file; defaults to ",(0,d.jsx)(n.em,{children:".config"})]}),"\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"--version"})," : version of the model if ",(0,d.jsx)(n.code,{children:"--model"})," is not passed"]}),"\n"]}),"\n",(0,d.jsx)(n.h3,{id:"example-2",children:"Example"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"dojo outputs --model=Topoflow"})}),"\n",(0,d.jsx)(n.pre,{children:(0,d.jsx)(n.code,{children:'Getting output file information for Topoflow ...\n\nTopoflow writes 4 output file(s):\n\n(1) Test1_2D-d-flood.nc: Land Surface Water Depth in netcdf format with the following labeled data:\n    Y: Y\n    X: longitude\n    datetime: Datetime\n    d_flood: Land Surface Water Depth\n\n(2) Test1_2D-Q.nc: Volumetric Discharge in netcdf format with the following labeled data:\n    Y: Y\n    X: longitude\n    datetime: Datetime\n    Q: Volumetric Discharge [m^3/s]\n\n(3) Test1_2D-d.nc: Max Channel Flow Depth in netcdf format with the following labeled data:\n    Y: Y\n    X: longitude\n    datetime: Datetime\n    d: Max Channel Flow Depth\n\n(4) Test1_2D-u.nc: Mean Channel Flow Velocity in netcdf format with the following labeled data:\n    Y: Y\n    X: longitude\n    datetime: Datetime\n    u: Mean Channel Flow Velocity\n\n"Topoflow" version 2ddd2cbe-364b-4520-a28e-a5691227db39 writes 8 accessory file(s):\n\n(1) Test1_0D-Q.png\n(2) Test1_0D-d-flood.png\n(3) Test1_0D-d.png\n(4) Test1_0D-u.png\n(5) Test1_2D-Q.mp4\n(6) Test1_2D-d-flood.mp4\n(7) Test1_2D-d.mp4\n(8) Test1_2D-u.mp4\n'})}),"\n",(0,d.jsx)(n.h2,{id:"parameters-3",children:(0,d.jsx)(n.em,{children:"parameters"})}),"\n",(0,d.jsx)(n.h3,{id:"description-2",children:"Description"}),"\n",(0,d.jsx)(n.p,{children:"Prints a description of model parameters and writes an example to file."}),"\n",(0,d.jsx)(n.h3,{id:"parameters-4",children:"Parameters"}),"\n",(0,d.jsxs)(n.ul,{children:["\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"--model"})," : name of the model"]}),"\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"--config"})," : name of configuation file; defaults to ",(0,d.jsx)(n.em,{children:".config"})]}),"\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"--version"})," : version of the model if ",(0,d.jsx)(n.code,{children:"--model"})," is not passed"]}),"\n"]}),"\n",(0,d.jsx)(n.h3,{id:"example-3",children:"Example"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"dojo parameters --model=CHIRPS-Monthly"})}),"\n",(0,d.jsx)(n.pre,{children:(0,d.jsx)(n.code,{children:"Getting parameters for CHIRPS-Monthly ...\n\nModel run parameters for CHIRPS-Monthly:\n\nParameter 1     : month\nDescription     : 2-digit month\nType            : int\nUnit            : month\nUnit Description: month\n\nParameter 2     : year\nDescription     : 4-digit year\nType            : int\nUnit            : years\nUnit Description: years\n\nParameter 3     : bounding box\nDescription     : geographical bounding box of x,y min/max values. format: [ [xmin, ymin], [xmax, ymax] ] example: [[33.512234, 2.719907], [49.98171,16.501768]]\nType            : float\nUnit            : longitude, latitude values\nUnit Description: longitude, latitude values\n\n\nExample parameters:\n\nmonth: 01\nyear: 2021\nbounding_box: '[[33.512234, 2.719907], [49.98171,16.501768]]'\n\nTemplate CHIRPS-Monthly parameters file written to params_template.json.\n"})}),"\n",(0,d.jsxs)(n.p,{children:["Additionally, ",(0,d.jsx)(n.code,{children:"parameters"})," will write ",(0,d.jsx)(n.em,{children:"params_template.json"})," with example model parameters:"]}),"\n",(0,d.jsx)(n.pre,{children:(0,d.jsx)(n.code,{children:'{\n    "month": 1,\n    "year": 2021,\n    "bounding_box": "[[33.512234, 2.719907], [49.98171,16.501768]]"\n}\n'})}),"\n",(0,d.jsx)(n.h2,{id:"results",children:(0,d.jsx)(n.em,{children:"results"})}),"\n",(0,d.jsx)(n.h3,{id:"description-3",children:"Description"}),"\n",(0,d.jsxs)(n.p,{children:["This command is used for models that have been run ",(0,d.jsx)(n.strong,{children:"detached"})," e.g. ",(0,d.jsx)(n.code,{children:'dojo runmodel -model="mymodel" --attached=False'}),". Normally, models that take a long time to run are executed detached."]}),"\n",(0,d.jsxs)(n.p,{children:["The ",(0,d.jsx)(n.em,{children:"results"})," command will check whether the model run has completed, and if so, copy the output and logs to the local output folder."]}),"\n",(0,d.jsx)(n.h3,{id:"parameters-5",children:"Parameters"}),"\n",(0,d.jsxs)(n.ul,{children:["\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"--id"})," : id of the docker container"]}),"\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"--name"})," : name of the docker container"]}),"\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"--config"})," : name of configuation file; defaults to ",(0,d.jsx)(n.em,{children:".config"})]}),"\n"]}),"\n",(0,d.jsxs)(n.p,{children:["One of either ",(0,d.jsx)(n.code,{children:"--id"})," or ",(0,d.jsx)(n.code,{children:"--name"})," is required. When you run a model, the name of the model Docker container will be displayed e.g."]}),"\n",(0,d.jsx)(n.pre,{children:(0,d.jsx)(n.code,{children:"Running Stochastic Gridded Conflict Model version 33cf1a60-2544-420f-ae08-b453a9751cfc in Docker container dojo-stochasticgriddedconflictmodel20211227133418\n"})}),"\n",(0,d.jsxs)(n.p,{children:["The model run Docker container id and name will also be listed in the file ",(0,d.jsx)(n.code,{children:"run-info.txt"})," in the local output folder (see the ",(0,d.jsx)(n.em,{children:"runmodel"})," section below for information regarding the output directory structure)."]}),"\n",(0,d.jsxs)(n.p,{children:["The model run Docker container id and name can also be found by the command ",(0,d.jsx)(n.code,{children:"docker ps -a"}),". Docker containers created by ",(0,d.jsx)(n.code,{children:"dojo --runmodel"})," will have the ",(0,d.jsx)(n.code,{children:"dojo-"})," prefix, followed by the model name and a datetime stamp."]}),"\n",(0,d.jsx)(n.h3,{id:"examples",children:"Examples"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"dojo results --name=dojo-mymodel20211225133418"})}),"\n",(0,d.jsx)(n.p,{children:"If the model is still running in the container, the above command will produce the following output:"}),"\n",(0,d.jsx)(n.pre,{children:(0,d.jsx)(n.code,{children:"Results for mymodel20211225133418 are not yet ready.\n"})}),"\n",(0,d.jsx)(n.p,{children:"when the model is finished, the output will be:"}),"\n",(0,d.jsx)(n.pre,{children:(0,d.jsx)(n.code,{children:'Run completed.\nModel output, run-parameters, and log files are located in "/mydojodata/runs/Stochastic Gridded Conflict Model/33cf1a60-2544-420f-ae08-b453a9751cfc/20211227140758".\n'})}),"\n",(0,d.jsx)(n.h2,{id:"runmodel",children:(0,d.jsx)(n.em,{children:"runmodel"})}),"\n",(0,d.jsx)(n.h3,{id:"description-4",children:"Description"}),"\n",(0,d.jsx)(n.p,{children:"Runs the selected model used the specified model parameters."}),"\n",(0,d.jsx)(n.h3,{id:"parameters-6",children:"Parameters"}),"\n",(0,d.jsxs)(n.ul,{children:["\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"--model"})," : name of the model"]}),"\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"--config"})," : name of configuation file; defaults to ",(0,d.jsx)(n.em,{children:".config"})]}),"\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"--params"})," : model parameters in JSON format"]}),"\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"--paramsfile"})," : name of file of model parameters in JSON format; defaults to ",(0,d.jsx)(n.em,{children:"params_template.json"}),"."]}),"\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"--outputdir"})," : folder specified for model output files; defaults to  ",(0,d.jsx)(n.code,{children:"/runs/{model}/{version}/{datetime}"})," e.g. ",(0,d.jsx)(n.em,{children:"/dojo-cli/runs/CHIRTSmax-Monthly/17bf37e3-3785-43be-a2a3-fec6add03376/20210403110420"})]}),"\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"--version"})," : version of the model if ",(0,d.jsx)(n.code,{children:"--model"})," is not passed"]}),"\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"--attached"})," : True or False, defaults to True.","\n",(0,d.jsxs)(n.ul,{children:["\n",(0,d.jsxs)(n.li,{children:["If ",(0,d.jsx)(n.code,{children:"attached"}),"=",(0,d.jsx)(n.code,{children:"True"})," or is not passed, the cli will wait for the model to run in the container and then remove the container."]}),"\n",(0,d.jsxs)(n.li,{children:["If ",(0,d.jsx)(n.code,{children:"attached"}),"=",(0,d.jsx)(n.code,{children:"False"})," the model will run in the container in background. The user will use ",(0,d.jsx)(n.a,{href:"#results",children:"dojo --results"})," to monitor when the model run is finished."]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,d.jsxs)(n.p,{children:["To run a model, the parameter values should either be assigned via the ",(0,d.jsx)(n.code,{children:"--params"})," option , or a json file specified via the ",(0,d.jsx)(n.code,{children:"--paramsfile"})," option. If neither parameter option is set, the --paramsfile filename ",(0,d.jsx)(n.em,{children:"params_template.json"})," will be used."]}),"\n",(0,d.jsxs)(n.p,{children:["After processing ",(0,d.jsx)(n.code,{children:"runmodel"})," will print the local directory where the model output and accessory (e.g. .mp4, .webm, .jpg) files are available. The local directory tree structure will consist of the model name, the model version, and a datetime stamp of the model run (unless specified by the ",(0,d.jsx)(n.code,{children:"--outputdir"})," option) e.g.:"]}),"\n",(0,d.jsx)(n.pre,{children:(0,d.jsx)(n.code,{children:"/runs\n | - Stochastic Gridded Conflict Model\n    |-17bf37e3-3785-43be-a2a3-fec6add03376\n        |- 20211209160543\n        |- output\n            |- conflict_IDs.rti\n            |- ...\n        |- acessorries\n            |- conflict_IDs_2D.mp4\n            - ...\n        |- accessories-captions.json\n        |- logs.txt\n        |- run-info.txt (only when running --attached=False)\n        |- run-parameters.json\n"})}),"\n",(0,d.jsxs)(n.p,{children:["In addition to the model's output and accessory files, ",(0,d.jsx)(n.code,{children:"runmodel"})," will write three other files:"]}),"\n",(0,d.jsxs)(n.ul,{children:["\n",(0,d.jsxs)(n.li,{children:["accessories-captions.json : descriptions of the files in ",(0,d.jsx)(n.em,{children:"accessories"})]}),"\n",(0,d.jsx)(n.li,{children:"logs.txt : the log output produced by this run"}),"\n",(0,d.jsx)(n.li,{children:"run-info.txt : model run information used by dojo. Includes docker container name and id."}),"\n",(0,d.jsx)(n.li,{children:"run-parameters.json : the model parameters used for this run"}),"\n"]}),"\n",(0,d.jsx)(n.h3,{id:"examples-1",children:"Examples"}),"\n",(0,d.jsxs)(n.p,{children:["(1) Run the CHIRPS-Monthly model using the default configuration settings in ",(0,d.jsx)(n.em,{children:".config"})," and model parameters in ",(0,d.jsx)(n.em,{children:"params_template.json"}),":"]}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:'dojo runmodel --model="CHIRPS-Monthly"'})}),"\n",(0,d.jsxs)(n.p,{children:["(2) Run the CHIRPS-Monthly model using the default configuration settings in ",(0,d.jsx)(n.em,{children:".config"})," and model parameters in ",(0,d.jsx)(n.em,{children:"chirps-monthly.json"}),":"]}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:'dojo runmodel --model="CHIRPS-Monthly" --paramsfile=chirps-monthly.json'})}),"\n",(0,d.jsxs)(n.p,{children:["(3) Run the CHIRPS-Monthly model using the default configuration settings in ",(0,d.jsx)(n.em,{children:".config"})," and specified model parameters:"]}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:'dojo runmodel --model="CHIRPS-Monthly" --params=\'{"month": "09", "year": "2016", "bounding_box": "[[33.512234, 2.719907], [49.98171,16.501768]]"}\''})}),"\n",(0,d.jsx)(n.p,{children:"(4) Run a specific version of CHIRPS-Monthly:"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:'dojo runmodel --version="a14ccbdf-c8d5-4816-af52-8b2ef3da9d22"'})}),"\n",(0,d.jsx)(n.p,{children:"(5) Run a specific version of CHIRPS-Monthly detached:"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:'dojo runmodel --version="a14ccbdf-c8d5-4816-af52-8b2ef3da9d22" --attached=False'})}),"\n",(0,d.jsx)(n.h3,{id:"models-missing-docker-images",children:"Models missing Docker images"}),"\n",(0,d.jsxs)(n.p,{children:["In some instances a user may attempt to run a model version that does not have a docker image associated with it. If this occurs ",(0,d.jsx)(n.em,{children:"dojo-cli"})," will list available model versions (most recent first). The user can then choose to run one of versions listed."]}),"\n",(0,d.jsx)(n.pre,{children:(0,d.jsx)(n.code,{children:'$ dojo runmodel --version="9d077a11-9db3-441c-a2ae-0ecacd1381f0"\nAPSIM-Cropping version 9d077a11-9db3-441c-a2ae-0ecacd1381f0 does not have a Docker image associated with it and therefore cannot be run.\n\nThe following versions of APSIM-Cropping are available to run:\ncreated date: 2021-12-14 16:14:44  version: ce2fc539-c734-4077-8b9c-2f82cd032049\ncreated date: 2021-12-08 19:41:17  version: c635fe68-9526-4719-8a15-9f6577bd9067\ncreated date: 2021-12-08 19:38:14  version: 53934f4c-04d8-4e02-920e-888208d68782\ncreated date: 2021-12-08 19:32:37  version: 90a77965-15b8-48f9-bf1e-6b25b29c44de\ncreated date: 2021-12-08 19:18:19  version: 229132d2-ad92-49d6-8639-7b240a05508b\ncreated date: 2021-12-07 20:28:52  version: 40efd965-0c5d-4ab0-8e88-c416a41c04df\ncreated date: 2021-12-01 15:45:33  version: 73560c5a-58a7-46a7-be0e-047c267d315e\ncreated date: 2021-11-28 16:23:12  version: a24b4539-15f3-4ee2-b802-4c7e092d19f2\ncreated date: 2021-11-28 16:20:40  version: 1b71a950-7580-49e5-a0f1-ecf9511fb1a7\ncreated date: 2021-11-28 16:20:11  version: 0e66a9c2-dbe3-4add-ab81-2e7502a7ad45\ncreated date: 2021-11-17 19:38:20  version: b99c87bd-cd0f-41d9-9bf7-2c93004c5e6b\ncreated date: 2021-11-17 19:33:39  version: 252b4f0a-ba15-4825-a155-1a3ca348da3b\ncreated date: 2021-11-17 17:30:58  version: e57e85cf-3a44-4a55-b63c-efb19af2527f\ncreated date: 2021-11-17 16:27:58  version: 32a238b9-5f16-4f6b-a085-b3e471be3dce\ncreated date: 2021-11-17 16:07:42  version: 915251a7-96eb-49ee-ac36-1a7db1e684bd\ncreated date: 2021-11-17 16:06:19  version: bb2793f1-526a-4796-b1b2-1006610e1d9e\ncreated date: 2021-11-17 16:05:13  version: 2ea95b10-f1dc-48b2-a675-82ca27fc03e6\ncreated date: 2021-11-17 16:00:43  version: 849d824c-a662-4da3-a131-d41c73afc42a\ncreated date: 2021-11-16 07:10:14  version: 2ff8502b-831e-4684-96cc-80f08da45f28\n'})}),"\n",(0,d.jsx)(n.h2,{id:"versions",children:(0,d.jsx)(n.em,{children:"versions"})}),"\n",(0,d.jsx)(n.h3,{id:"description-5",children:"Description"}),"\n",(0,d.jsx)(n.p,{children:"List all versions of a model."}),"\n",(0,d.jsx)(n.h3,{id:"parameters-7",children:"Parameters"}),"\n",(0,d.jsxs)(n.ul,{children:["\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"--model"})," : name of the model"]}),"\n",(0,d.jsxs)(n.li,{children:[(0,d.jsx)(n.code,{children:"--config"})," : name of configuation file; defaults to ",(0,d.jsx)(n.em,{children:".config"})]}),"\n"]}),"\n",(0,d.jsx)(n.h3,{id:"example-4",children:"Example"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"dojo versions --model=CHIRPS-Monthly"})}),"\n",(0,d.jsx)(n.pre,{children:(0,d.jsx)(n.code,{children:'Getting versions of "CHIRPS-Monthly" ...\n\nAvailable versions of "CHIRPS-Monthly":\n\nCurrent Version\n"17bf37e3-3785-43be-a2a3-fec6add03376"\n\nPrevious Versions\n"a14ccbdf-c8d5-4816-af52-8b2ef3da9d22"\n\nLater Versions\n\n'})})]})}function m(e={}){const{wrapper:n}={...(0,o.a)(),...e.components};return n?(0,d.jsx)(n,{...e,children:(0,d.jsx)(h,{...e})}):h(e)}},4285:(e,n,i)=>{i.d(n,{Z:()=>l});i(7294);var d=i(4996),o=i(5893);function l(e){let{width:n,file:i,title:l}=e;return(0,o.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center"},children:[(0,o.jsx)("img",{src:(0,d.Z)(`/img/${i}`),width:n,alt:l}),(0,o.jsx)("p",{children:(0,o.jsx)("i",{children:l})})]})}},1151:(e,n,i)=>{i.d(n,{Z:()=>r,a:()=>s});var d=i(7294);const o={},l=d.createContext(o);function s(e){const n=d.useContext(l);return d.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:s(e.components),d.createElement(l.Provider,{value:n},e.children)}}}]);
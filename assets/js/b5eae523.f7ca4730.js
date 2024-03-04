"use strict";(self.webpackChunkdojo_docs_v_2=self.webpackChunkdojo_docs_v_2||[]).push([[741],{4510:(e,o,n)=>{n.r(o),n.d(o,{assets:()=>l,contentTitle:()=>r,default:()=>h,frontMatter:()=>a,metadata:()=>s,toc:()=>d});var t=n(5893),i=n(1151);const a={layout:"default",title:"Model Registration",has_children:!0,has_toc:!0},r="Model Registration",s={id:"model-registration",title:"Model Registration",description:"Overview",source:"@site/docs/model-registration.md",sourceDirName:".",slug:"/model-registration",permalink:"/model-registration",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{layout:"default",title:"Model Registration",has_children:!0,has_toc:!0},sidebar:"dojoSidebar",previous:{title:"Data Modeling Video Tutorial",permalink:"/video-howtos/data-modeling"},next:{title:"Cheatsheet",permalink:"/model-registration/cheatsheet"}},l={},d=[{value:"Overview",id:"overview",level:2},{value:"Model Metadata and Provenance",id:"model-metadata-and-provenance",level:2},{value:"Containerization and Execution",id:"containerization-and-execution",level:2},{value:"Building your model",id:"building-your-model",level:3},{value:"Dojo Commands:",id:"dojo-commands",level:3},{value:"Configuration File Annotation",id:"configuration-file-annotation",level:3},{value:"Directive Annotation",id:"directive-annotation",level:3},{value:"Output File Annotation",id:"output-file-annotation",level:3},{value:"Editing or Deleting Existing Dojo Files",id:"editing-or-deleting-existing-dojo-files",level:3},{value:"Completing the Registration",id:"completing-the-registration",level:3},{value:"Summary Page and Publishing",id:"summary-page-and-publishing",level:3},{value:"Video Walkthrough",id:"video-walkthrough",level:2}];function c(e){const o={a:"a",admonition:"admonition",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",img:"img",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,i.a)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(o.h1,{id:"model-registration",children:"Model Registration"}),"\n",(0,t.jsx)(o.h2,{id:"overview",children:"Overview"}),"\n",(0,t.jsx)(o.p,{children:"There are two main activities associated with registering a model to Dojo:"}),"\n",(0,t.jsxs)(o.ol,{children:["\n",(0,t.jsxs)(o.li,{children:["\n",(0,t.jsxs)(o.p,{children:[(0,t.jsx)(o.strong,{children:"Model Metadata and Provenance"}),": modelers begin the registration process by providing key metadata about their model and choosing relevant geographic regions so that Dojo can facilitate search and discovery across its model registry."]}),"\n"]}),"\n",(0,t.jsxs)(o.li,{children:["\n",(0,t.jsxs)(o.p,{children:[(0,t.jsx)(o.strong,{children:"Containerization and Execution"}),": next, modelers are directed to a containerization environment. Here, modelers teach Dojo how to run their models and how to set parameters. They can also provide metadata about model output files. The end result is the publication of a Docker image and associated metadata about the registered model."]}),"\n"]}),"\n"]}),"\n",(0,t.jsxs)(o.p,{children:["To get started, visit ",(0,t.jsx)(o.a,{href:"https://dojo-modeling.com/",children:"https://dojo-modeling.com"}),". Please reach out to ",(0,t.jsx)(o.a,{href:"mailto:dojo@jataware.com",children:"dojo@jataware.com"})," for credentials or help with the application."]}),"\n",(0,t.jsx)(o.h2,{id:"model-metadata-and-provenance",children:"Model Metadata and Provenance"}),"\n",(0,t.jsx)(o.p,{children:"To begin the process, Dojo captures metadata about each model and its maintainer. It's important to be as thorough as possible to ensure that the end-user can understand at a high-level what each model does, how it does it, and what it produces."}),"\n",(0,t.jsx)(o.p,{children:(0,t.jsx)(o.img,{alt:"Model Registration",src:n(9480).Z+"",width:"1201",height:"834"})}),"\n",(0,t.jsx)(o.p,{children:"Key definitions:"}),"\n",(0,t.jsxs)(o.ul,{children:["\n",(0,t.jsxs)(o.li,{children:[(0,t.jsx)(o.code,{children:"Model Name"}),": (required) The end-user will see this name when running your model. While spaces and upper/lower case are allowed, ",(0,t.jsx)(o.em,{children:(0,t.jsx)(o.strong,{children:"do not use special characters, including parentheses"})}),"."]}),"\n",(0,t.jsxs)(o.li,{children:[(0,t.jsx)(o.code,{children:"Model Website"}),": (required) This can be a link to your model repository or another website that provides additional context about your model."]}),"\n",(0,t.jsxs)(o.li,{children:[(0,t.jsx)(o.code,{children:"Model Family"}),": (required) Model family refers to a group of models with similar characteristics. If you have several procedures based on the same underlying model family, you can link those models or model procedures here under a common family name of your choosing, such as ",(0,t.jsx)(o.code,{children:"LPJmL"}),". If your model does not have a natural grouping with other models, you can name it with an appropriate category related to your model or repeat your model name."]}),"\n",(0,t.jsxs)(o.li,{children:[(0,t.jsx)(o.code,{children:"Model Description"}),": (required) This is the forward-facing documentation about your model that the end-user will see. Include as much information as possible to explain what your model does and what it produces. Include notes that may be required to explain model idiosyncrasies. If your model takes a long time to run, you may want to include an estimated run time."]}),"\n"]}),"\n",(0,t.jsx)(o.p,{children:"The next page captures general metadata about the model and its maintainer. There is a short demo below, as well as definitions for each field:"}),"\n",(0,t.jsx)(o.p,{children:(0,t.jsx)(o.img,{alt:"Model Specifics",src:n(2662).Z+"",width:"1202",height:"844"})}),"\n",(0,t.jsx)(o.p,{children:"Key definitions:"}),"\n",(0,t.jsxs)(o.ul,{children:["\n",(0,t.jsxs)(o.li,{children:[(0,t.jsx)(o.code,{children:"Maintainer Name"}),": (required) The primary point of contact for the model."]}),"\n",(0,t.jsxs)(o.li,{children:[(0,t.jsx)(o.code,{children:"Maintainer Email"}),": (required) The primary point of contact's e-mail address. If you have one, a group e-mail is also acceptable."]}),"\n",(0,t.jsxs)(o.li,{children:[(0,t.jsx)(o.code,{children:"Maintainer Organization"}),": (required) The organization that developed the model."]}),"\n",(0,t.jsxs)(o.li,{children:[(0,t.jsx)(o.code,{children:"Model Start/End Date"}),": (optional) The start and end date of the model's coverage."]}),"\n",(0,t.jsxs)(o.li,{children:[(0,t.jsx)(o.code,{children:"Model Domain(s)"}),": (optional) A preset list of general subject domains that your model may fit into. You can select as many of these domains as you feel fit your model. Domains can help end-users search for models by broad model type/subject area."]}),"\n"]}),"\n",(0,t.jsx)(o.p,{children:"Next, modelers provide optional information about the model's geographic coverage. Modelers can add geographic areas by either:"}),"\n",(0,t.jsxs)(o.ul,{children:["\n",(0,t.jsx)(o.li,{children:"selecting an area by name"}),"\n",(0,t.jsx)(o.li,{children:"building a bounding box around an area of interest"}),"\n"]}),"\n",(0,t.jsx)(o.p,{children:"Steps to add a geographic coverage by name:"}),"\n",(0,t.jsx)(o.p,{children:(0,t.jsx)(o.img,{alt:"Add Region by Name",src:n(352).Z+"",width:"1202",height:"1016"})}),"\n",(0,t.jsxs)(o.ol,{children:["\n",(0,t.jsxs)(o.li,{children:["Click on ",(0,t.jsx)(o.code,{children:"ADD REGIONS BY NAME"})]}),"\n",(0,t.jsx)(o.li,{children:"In the search box, enter a place name, country, or any admin-level 1 through 3."}),"\n",(0,t.jsx)(o.li,{children:"Select your desired region from the dropdown menu."}),"\n",(0,t.jsxs)(o.li,{children:["Your selection will appear in the search box: ",(0,t.jsxs)(o.strong,{children:["click on ",(0,t.jsx)(o.code,{children:"ADD REGION"})]})," to add it to the ",(0,t.jsx)(o.code,{children:"Selected Regions"}),"."]}),"\n",(0,t.jsx)(o.li,{children:"Repeat the process to add any other geographic areas."}),"\n"]}),"\n",(0,t.jsxs)(o.p,{children:[(0,t.jsx)(o.img,{alt:"Add Region by Bounding Box",src:n(1823).Z+"",width:"1200",height:"1216"}),"\n",(0,t.jsx)(o.img,{alt:"Mapped Region by Bounding Box",src:n(4504).Z+"",width:"1205",height:"1250"})]}),"\n",(0,t.jsx)(o.p,{children:"Steps to add a geographic coverage by building a bounding box:"}),"\n",(0,t.jsxs)(o.ol,{children:["\n",(0,t.jsxs)(o.li,{children:["Click on ",(0,t.jsx)(o.code,{children:"ADD REGIONS BY COORDINATES"})]}),"\n",(0,t.jsx)(o.li,{children:"Enter your bounding box coordinates:"}),"\n"]}),"\n",(0,t.jsxs)(o.ul,{children:["\n",(0,t.jsx)(o.li,{children:"Corner 1: The latitude and longitude of the northwest corner of your bounding box."}),"\n",(0,t.jsx)(o.li,{children:"Corner 2: The latitude and longitude of the southeast corner of your bounding box."}),"\n"]}),"\n",(0,t.jsx)(o.admonition,{type:"tip",children:(0,t.jsx)(o.p,{children:"Western longitudes and Southern latitudes are negative"})}),"\n",(0,t.jsxs)(o.ol,{start:"3",children:["\n",(0,t.jsxs)(o.li,{children:["\n",(0,t.jsxs)(o.p,{children:["Select ",(0,t.jsx)(o.code,{children:"ADD REGION TO MAP"})]}),"\n",(0,t.jsxs)(o.blockquote,{children:["\n",(0,t.jsx)(o.p,{children:"Note : The map does not automatically zoom in on newly added coordinates. You can zoom in manually to find your bounding box. If it is incorrect, you can remove it by clicking the X on the coordinates in the Selected Regions above."}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,t.jsxs)(o.p,{children:["Once you have added your geographic areas, click ",(0,t.jsx)(o.code,{children:"SUBMIT MODEL"})," to move the next step in the registration process."]}),"\n",(0,t.jsx)(o.h2,{id:"containerization-and-execution",children:"Containerization and Execution"}),"\n",(0,t.jsx)(o.p,{children:"To launch the model execution environment, you will need to select a base image from the available drop-down menu. You may also provide the ID of an existing Debian (Ubuntu) based Docker image on Dockerhub to use as your starting point."}),"\n",(0,t.jsx)(o.p,{children:(0,t.jsx)(o.img,{alt:"Select Worker",src:n(1487).Z+"",width:"1081",height:"1219"})}),"\n",(0,t.jsxs)(o.p,{children:["After you've selected an image image, clicking ",(0,t.jsx)(o.code,{children:"LAUNCH"})," will bring you to the ",(0,t.jsx)(o.code,{children:"provisioning"})," page, where you'll wait to be redirected to the terminal once your Docker image has been loaded."]}),"\n",(0,t.jsx)(o.p,{children:(0,t.jsx)(o.img,{alt:"Provisioning",src:n(8538).Z+"",width:"1076",height:"1127"})}),"\n",(0,t.jsx)(o.h3,{id:"building-your-model",children:"Building your model"}),"\n",(0,t.jsx)(o.p,{children:"You will build your model image inside the model execution environment (a Docker container). While all models are different, the general approach is to:"}),"\n",(0,t.jsxs)(o.ul,{children:["\n",(0,t.jsx)(o.li,{children:"Clone your model code into the container."}),"\n",(0,t.jsx)(o.li,{children:"Install any requirements needed to run your model."}),"\n",(0,t.jsx)(o.li,{children:"Test model execution. This can be an iterative approach in that you can make several test runs to ensure that your model is running and producing the expected results."}),"\n",(0,t.jsx)(o.li,{children:"Once you have a successful model run, Dojo will need to learn how you run your model, what input parameters you want to expose to the end-user, metadata about your output file(s), and the directory where your results are located."}),"\n"]}),"\n",(0,t.jsx)(o.h3,{id:"dojo-commands",children:"Dojo Commands:"}),"\n",(0,t.jsxs)(o.p,{children:["Along with the Linux terminal commands you'll be able to execute in the virtual terminal as you configure your model, Dojo has a number of custom commands to help you register your model. You can type ",(0,t.jsx)(o.code,{children:"dojo"})," at any time while in the terminal to bring up the helper text in the terminal, or view the ",(0,t.jsx)(o.a,{href:"model-registration/cheatsheet",children:"command cheatsheet"}),"."]}),"\n",(0,t.jsx)(o.p,{children:(0,t.jsx)(o.img,{alt:"Dojo Command",src:n(5187).Z+"",width:"1202",height:"1124"})}),"\n",(0,t.jsx)(o.h3,{id:"configuration-file-annotation",children:"Configuration File Annotation"}),"\n",(0,t.jsx)(o.p,{children:"If your model uses configuration files to set parameters or tunable knobs, you will need to annotate them in order to expose these parameters to Dojo end-users. Once the configuration file parameter templater tool is launched, you can annotate each parameter and provide metadata."}),"\n",(0,t.jsxs)(o.p,{children:["With Dojo, you can annotate any plain text/ascii configuration file, including ",(0,t.jsx)(o.code,{children:".txt"}),", ",(0,t.jsx)(o.code,{children:".yaml"}),", ",(0,t.jsx)(o.code,{children:".json"}),", ",(0,t.jsx)(o.code,{children:".xml"}),", etc."]}),"\n",(0,t.jsx)(o.p,{children:(0,t.jsx)(o.img,{alt:"Parameter Templater Tool",src:n(9479).Z+"",width:"1318",height:"736"})}),"\n",(0,t.jsxs)(o.p,{children:["To launch the parameter templater tool, run (replace ",(0,t.jsx)(o.code,{children:"<path_to_config_file.json>"})," with the appropriate file path and name):"]}),"\n",(0,t.jsx)(o.pre,{children:(0,t.jsx)(o.code,{children:"dojo config <path_to_config_file.json>\n"})}),"\n",(0,t.jsxs)(o.ol,{children:["\n",(0,t.jsxs)(o.li,{children:["Selecting your parameter. Only highlight the parameters you wish to expose to the end-user. After highlighting ",(0,t.jsx)(o.em,{children:"only the parameter value you wish to expose"})," (i.e. do not highlight the quotes of strings or the variable name), Dojo will launch an annotation sidebar to describe your parameter."]}),"\n",(0,t.jsx)(o.li,{children:"Available fields:"}),"\n"]}),"\n",(0,t.jsxs)(o.ul,{children:["\n",(0,t.jsxs)(o.li,{children:[(0,t.jsx)(o.code,{children:"Name"}),": The natural language name that you want to call your parameter; string only, spaces are allowed."]}),"\n",(0,t.jsxs)(o.li,{children:[(0,t.jsx)(o.code,{children:"Description"}),": As with your model description, the parameter description should be detailed. The end-user will rely on this description to gain an understanding of the parameter. Make sure to include examples alongside explanations if using non-standard formats. For example, explain that choosing input Parameter A requires the end-user to select a subset from input Parameter B."]}),"\n",(0,t.jsxs)(o.li,{children:[(0,t.jsx)(o.code,{children:"Type"}),": Available options include string, integer, float, Date/time, and boolean. Choose the type from the dropdown that classifies your parameter."]}),"\n",(0,t.jsxs)(o.li,{children:[(0,t.jsx)(o.code,{children:"Pre-Defined Options"}),": A checkbox option if you would like to constrain the available parameter values to the end-user. Selecting the checkbox will expand the annotation window and allow you to enter any desired parameter values. ",(0,t.jsx)(o.strong,{children:"These values must align with your model"}),". I.e. if your model is expecting an underscore between countries with 2+ names, then your entry here must include the underscore. Select ",(0,t.jsx)(o.code,{children:"Add option"})," as needed to include additional parameter values."]}),"\n",(0,t.jsxs)(o.li,{children:[(0,t.jsx)(o.code,{children:"Default Value"}),": While not required, it is recommended to provide a default parameter value."]}),"\n",(0,t.jsxs)(o.li,{children:[(0,t.jsx)(o.code,{children:"Unit"}),": Required if applicable to your parameter. There is a field below to describe the unit, so here simply enter the units such as KG/HA or kilograms per hectare."]}),"\n",(0,t.jsxs)(o.li,{children:[(0,t.jsx)(o.code,{children:"Unit Description"}),": Add detail here to fully explain the parameter's unit. For example, kilograms of crop produced per hectare during the rainy season."]}),"\n",(0,t.jsxs)(o.li,{children:[(0,t.jsx)(o.code,{children:"Data Type"}),": Available options include nominal, ordinal, numerical, and freeform. Choose the appropriate data-type from the dropdown for your parameter."]}),"\n",(0,t.jsxs)(o.li,{children:[(0,t.jsx)(o.code,{children:"Save"}),": Select save when complete. You can also select cancel should you no longer want to annotate the parameter and your updates will not be saved."]}),"\n",(0,t.jsxs)(o.li,{children:[(0,t.jsx)(o.code,{children:"Delete Parameter"}),": If you are editing a previously saved parameter, there will also be an option to delete the parameter. This option will not appear unless the parameter has already been saved to the config template."]}),"\n"]}),"\n",(0,t.jsx)(o.p,{children:(0,t.jsx)(o.img,{alt:"Templater Editor Open",src:n(5013).Z+"",width:"1317",height:"862"})}),"\n",(0,t.jsx)(o.p,{children:"You can also edit or move existing annotated parameters by hovering your mouse over the highlight and clicking on one of the two buttons."}),"\n",(0,t.jsx)(o.p,{children:(0,t.jsx)(o.img,{alt:"Templater Tooltip",src:n(594).Z+"",width:"1316",height:"628"})}),"\n",(0,t.jsxs)(o.p,{children:["Once you have parameters saved to your configuration file, you can view a list of all of your current parameters by clicking the ",(0,t.jsx)(o.code,{children:"View All Parameters"})," button."]}),"\n",(0,t.jsx)(o.p,{children:(0,t.jsx)(o.img,{alt:"View All Parameters",src:n(5230).Z+"",width:"1313",height:"602"})}),"\n",(0,t.jsx)(o.p,{children:"Repeat the above process for every applicable parameter value in your configuration file. Once complete, select save in the upper right-hand corner; this will save your annotated configuration file in Dojo. You may annotate multiple configuration files."}),"\n",(0,t.jsxs)(o.blockquote,{children:["\n",(0,t.jsx)(o.p,{children:'Note: upon model execution, Dojo accepts parameter selections from end users and "rehydrates" the relevant config files with those parameter selections.'}),"\n"]}),"\n",(0,t.jsx)(o.h3,{id:"directive-annotation",children:"Directive Annotation"}),"\n",(0,t.jsxs)(o.p,{children:["On the right-hand side of the terminal there is a section labeled 'Shell History' where your commands will appear as you enter them. Most entries will have a button to their right reading ",(0,t.jsx)(o.code,{children:"MARK AS DIRECTIVE"}),". Click the button next to the appropriate model run command to launch an annotation window. Annotating the directive allows you to expose and describe parameters to the end-user."]}),"\n",(0,t.jsx)(o.p,{children:(0,t.jsx)(o.img,{alt:"Directive Select",src:n(5276).Z+"",width:"693",height:"951"})}),"\n",(0,t.jsxs)(o.p,{children:["The same process applies to directive annotations as applied to ",(0,t.jsx)(o.a,{href:"#configuration-file-annotation",children:"configuration annotation"}),"."]}),"\n",(0,t.jsx)(o.p,{children:(0,t.jsx)(o.img,{alt:"Directive With Parameter",src:n(2676).Z+"",width:"1305",height:"485"})}),"\n",(0,t.jsx)(o.p,{children:"Repeat the annotation process for every applicable parameter value in your model execution directive. Once complete, select save in the upper right-hand corner; this will save your annotated directive in Dojo. It will then appear in the Model Execution Directive panel on the right side of the terminal and the left of the model summary page."}),"\n",(0,t.jsx)(o.p,{children:(0,t.jsx)(o.img,{alt:"Terminal with Directive",src:n(2091).Z+"",width:"830",height:"650"})}),"\n",(0,t.jsxs)(o.blockquote,{children:["\n",(0,t.jsx)(o.p,{children:"Note: your model can have only one directive. If running your model is a multi-step process, you must combine those steps into a single executable script or command."}),"\n"]}),"\n",(0,t.jsx)(o.h3,{id:"output-file-annotation",children:"Output File Annotation"}),"\n",(0,t.jsx)(o.p,{children:"Once your model has run, you will need to annotate your output file(s). This step provides the required metadata to geocode, associate, and format columns, and then convert your output to a Geotemporal dataset."}),"\n",(0,t.jsxs)(o.blockquote,{children:["\n",(0,t.jsxs)(o.p,{children:["Currently, Dojo supports ",(0,t.jsx)(o.code,{children:".csv"}),", ",(0,t.jsx)(o.code,{children:".nc"})," (NetCDF), and ",(0,t.jsx)(o.code,{children:".tiff"})," (GeoTIFF). The files must have these correct extensions. For example, a ",(0,t.jsx)(o.code,{children:".txt"})," file that is ",(0,t.jsx)(o.code,{children:","}),' delimited, though technically a "CSV", will not be handled correctly by Dojo.']}),"\n"]}),"\n",(0,t.jsxs)(o.p,{children:["To launch the output file annotation tool, run (replace ",(0,t.jsx)(o.code,{children:"<path_to_output_file.csv>"})," with the appropriate file path and name):"]}),"\n",(0,t.jsx)(o.pre,{children:(0,t.jsx)(o.code,{children:"\ndojo annotate <path_to_output_file.csv>\n"})}),"\n",(0,t.jsxs)(o.p,{children:["For a detailed description on how to do this, please go to ",(0,t.jsx)(o.a,{href:"/data-registration",children:"Data Registration"}),". Some of the form elements differ slightly from the data registration workflow, but the annotation process remains the same."]}),"\n",(0,t.jsx)(o.h3,{id:"editing-or-deleting-existing-dojo-files",children:"Editing or Deleting Existing Dojo Files"}),"\n",(0,t.jsx)(o.p,{children:"Under the Shell History panel on the right hand side of the terminal, you'll find all your Dojo file metadata listed under three tabs (Configs, Outputs, and Accessories). If you want to edit (note: edit not available for Accessories) or delete any of these entries, you can click the pencil or trash icons on the relevant file card. You can also do this on the Summary page, which comes after you've clicked the 'Save and Continue' button at the bottom of this page."}),"\n",(0,t.jsx)(o.p,{children:(0,t.jsx)(o.img,{alt:"Terminal Edit File",src:n(1927).Z+"",width:"774",height:"698"})}),"\n",(0,t.jsx)(o.h3,{id:"completing-the-registration",children:"Completing the Registration"}),"\n",(0,t.jsx)(o.p,{children:"When you have completed the above steps, you are ready to publish your model image to DockerHub. This image will be used downstream from the model registration process and allow end-users to change exposed parameters, run the updated model, and then inspect and conduct analyses with the results."}),"\n",(0,t.jsx)(o.p,{children:"As a recap, before publishing your image, you should have:"}),"\n",(0,t.jsxs)(o.ol,{children:["\n",(0,t.jsx)(o.li,{children:"Uploaded your model."}),"\n",(0,t.jsx)(o.li,{children:"Installed any dependencies."}),"\n",(0,t.jsx)(o.li,{children:"Iteratively tested your model and verified model behavior / results."}),"\n",(0,t.jsx)(o.li,{children:"For directive-type models: annotated all desired parameters on the command line; this includes both parameters you want to expose and parameters that will remain static but for which you would like to provide additional context."}),"\n",(0,t.jsx)(o.li,{children:"For configuration-type models: annotated all desired parameters in the configuration file."}),"\n",(0,t.jsx)(o.li,{children:"Annotated the model output file(s) to define the metadata, geocode, and transform your output to a Geotemporal dataset."}),"\n",(0,t.jsx)(o.li,{children:"Defined the location / directory of your output file(s). This is required in order to mount your model output and complete the geocoding and geotemporal transform of the results."}),"\n"]}),"\n",(0,t.jsx)(o.p,{children:(0,t.jsx)(o.img,{alt:"Terminal Complete",src:n(2838).Z+"",width:"1231",height:"1107"})}),"\n",(0,t.jsxs)(o.p,{children:["If you have done all the above, you are ready to review your image for publication. Select ",(0,t.jsx)(o.code,{children:"SAVE AND CONTINUE"}),"."]}),"\n",(0,t.jsxs)(o.p,{children:["If you want to discard the changes made to your model since launching the execution environment, you can instead select ",(0,t.jsx)(o.code,{children:"ABANDON SESSION"}),". This will send you to the model's summary page. From the summary page you can relaunch the model to get back to the terminal/execution environment if you decide to make changes to the model in the future."]}),"\n",(0,t.jsx)(o.h3,{id:"summary-page-and-publishing",children:"Summary Page and Publishing"}),"\n",(0,t.jsx)(o.p,{children:"This will take you to the Model Summary page, where you can review the model metadata, configuration files, output files, and other information before publishing it to Dockerhub. You can make changes to your model on this page while your model is running, either by clicking the 'EDIT' button on the Model Details or by clicking the Pencil icon on any of the model files or directive. You can also go back to the terminal with the 'Back to Terminal' button in the upper left."}),"\n",(0,t.jsxs)(o.blockquote,{children:["\n",(0,t.jsx)(o.p,{children:"Note: Your model will automatically shut down after 15 minutes on the Summary page. If you are still working and need more time, you can refresh the page or go back to the terminal and come back to the Summary page. If your model shuts down, you can relaunch it from the Summary page at any time."}),"\n"]}),"\n",(0,t.jsxs)(o.p,{children:["When you arrive on the Summary page, there will be an upload bar. This is your model's changes being saved to Dockerhub. Please do not close the browser while the upload is in progress. However, ",(0,t.jsx)(o.strong,{children:"you must publish your model"})," to complete the registration process."]}),"\n",(0,t.jsx)(o.p,{children:(0,t.jsx)(o.img,{alt:"Summary Uploading",src:n(954).Z+"",width:"1245",height:"1109"})}),"\n",(0,t.jsxs)(o.p,{children:["Once the upload is complete and you have reviewed your model, ",(0,t.jsx)(o.strong,{children:"click the blue PUBLISH button"})," in the lower right to publish your model. This will open a dialog where you will have an opportunity to add a commit message. Any time you make changes to your model in Dojo, you will need to publish it as a a new version, so commit messages can be helpful to keep track of the changes from version to version."]}),"\n",(0,t.jsx)(o.p,{children:(0,t.jsx)(o.img,{alt:"Publish Dialog",src:n(7116).Z+"",width:"758",height:"599"})}),"\n",(0,t.jsx)(o.p,{children:"After successfully publishing, you will see a link to view your model on Causemos, and your model run on Dojo will be terminated. If you want to make any further changes, you will need to make a new version and publish it again."}),"\n",(0,t.jsx)(o.p,{children:(0,t.jsx)(o.img,{alt:"Publish Confirmed",src:n(5271).Z+"",width:"538",height:"249"})}),"\n",(0,t.jsxs)(o.p,{children:["You can also view your model on ",(0,t.jsx)(o.a,{href:"https://hub.docker.com/repository/docker/jataware/dojo-publish",children:"Dockerhub"}),". You may need to expand the tags section."]}),"\n",(0,t.jsx)(o.h2,{id:"video-walkthrough",children:"Video Walkthrough"}),"\n",(0,t.jsx)(o.p,{children:"The video below provides a full demonstration of registering a model in Dojo from start to finish."}),"\n",(0,t.jsx)("iframe",{width:"560",height:"315",src:"https://www.youtube-nocookie.com/embed/stvtNUrEKDU",title:"YouTube video player",frameborder:"0",allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",allowfullscreen:!0})]})}function h(e={}){const{wrapper:o}={...(0,i.a)(),...e.components};return o?(0,t.jsx)(o,{...e,children:(0,t.jsx)(c,{...e})}):c(e)}},2676:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/directive-with-parameter-7e734fd5f1ce2edb08c12610f8d4b7ff.png"},5187:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/dojo-command-a8dd86a62030de0705a98b13528ba35b.png"},1487:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/provision-select-a59a484c8983df04815911a580ab204d.png"},8538:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/provisioning-638ef965cb38849aecdbe324e72bde3f.png"},5271:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/publish-confirmed-af5a85cabec53519a2673056e369c39a.png"},7116:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/publish-dialog-f1fea9fbb2e47827f944bf54d8cad598.png"},9480:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/registration-1-model-overview-7bcef0e04a7472443fa3b40cfbbcdc0d.png"},2662:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/registration-2-model-details-313702155fd9f51997eba1a1a06eae6d.png"},352:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/registration-3.1-model-region-name-8acbbaab22627a23489ec99fd0f23645.png"},1823:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/registration-3.3-model-region-coords-search-de41d55717156ff3600e7f081bf59381.png"},4504:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/registration-3.4-model-region-coords-added-095a0055aadb4d9ee4aa98f03884fff9.png"},954:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/summary-uploading-96a2e809bcc299f9eab514556297f694.png"},5230:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/templater-all-parameters-7728ca7e3df3c5c8a60721e514a1a9c9.png"},5013:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/templater-annotation-panel-fd6f40ef1e95dd949de444e2b0fd3822.png"},9479:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/templater-highlight-a322c87635d2720184f9191fc1eda10b.png"},594:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/templater-tooltip-e3a25e3fdd76067a70235e32d41accf2.png"},2838:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/terminal-complete-c65d2e73528fabb56d3e978baf6fab15.png"},1927:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/terminal-edit-file-d90f378f7c3d330678eec27070d3657c.png"},5276:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/terminal-selecting-directive-1a989e8fe7329a947a1f9ec9b52666ab.png"},2091:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/terminal-with-directive-a36296e7c158dce12769e30a34a20198.png"},1151:(e,o,n)=>{n.d(o,{Z:()=>s,a:()=>r});var t=n(7294);const i={},a=t.createContext(i);function r(e){const o=t.useContext(a);return t.useMemo((function(){return"function"==typeof e?e(o):{...o,...e}}),[o,e])}function s(e){let o;return o=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:r(e.components),t.createElement(a.Provider,{value:o},e.children)}}}]);
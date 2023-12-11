"use strict";(self.webpackChunkdojo_docs_v_2=self.webpackChunkdojo_docs_v_2||[]).push([[489],{673:(e,t,i)=>{i.r(t),i.d(t,{assets:()=>d,contentTitle:()=>o,default:()=>u,frontMatter:()=>r,metadata:()=>l,toc:()=>c});var a=i(5893),n=i(1151),s=i(4285);const r={layout:"default",title:"Data Registration",has_children:!0,has_toc:!0},o="Data Registration",l={id:"data-registration",title:"Data Registration",description:"Getting started",source:"@site/docs/data-registration.mdx",sourceDirName:".",slug:"/data-registration",permalink:"/dojo/data-registration",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{layout:"default",title:"Data Registration",has_children:!0,has_toc:!0},sidebar:"dojoSidebar",previous:{title:"Uploading Large Files",permalink:"/dojo/model-registration/large-files"},next:{title:"Geotemporal Format",permalink:"/dojo/data-registration/geotemporal-format"}},d={},c=[{value:"Getting started",id:"getting-started",level:2},{value:"Metadata capture",id:"metadata-capture",level:3},{value:"Geo and time inference",id:"geo-and-time-inference",level:2},{value:"Annotating your dataset",id:"annotating-your-dataset",level:2},{value:"Date formatting",id:"date-formatting",level:3},{value:"Build a date",id:"build-a-date",level:3},{value:"Coordinate pairs",id:"coordinate-pairs",level:3},{value:"Multi-part geographies",id:"multi-part-geographies",level:3},{value:"Qualifiers",id:"qualifiers",level:3},{value:"Add Alias",id:"add-alias",level:3},{value:"Feature Statistics",id:"feature-statistics",level:2},{value:"Manual Data Transformations",id:"manual-data-transformations",level:2},{value:"Adjust Geospatial Resolution",id:"adjust-geospatial-resolution",level:3},{value:"Select Geospatial Coverage",id:"select-geospatial-coverage",level:3},{value:"Adjust Temporal Coverage",id:"adjust-temporal-coverage",level:3},{value:"Select Temporal Coverage",id:"select-temporal-coverage",level:3},{value:"Processing the dataset",id:"processing-the-dataset",level:2}];function h(e){const t={a:"a",admonition:"admonition",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",img:"img",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,n.a)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(t.h1,{id:"data-registration",children:"Data Registration"}),"\n",(0,a.jsx)(t.h2,{id:"getting-started",children:"Getting started"}),"\n",(0,a.jsx)(t.p,{children:"The data registration workflow currently supports 4 data types:"}),"\n",(0,a.jsxs)(t.ul,{children:["\n",(0,a.jsx)(t.li,{children:"CSV"}),"\n",(0,a.jsx)(t.li,{children:"Excel"}),"\n",(0,a.jsx)(t.li,{children:"NetCDF"}),"\n",(0,a.jsx)(t.li,{children:"GeoTIFF"}),"\n"]}),"\n",(0,a.jsxs)(t.p,{children:["You can register a dataset by clicking the Register a Dataset link on the Dojo landing page or above the list of all existing datasets. Please reach out to ",(0,a.jsx)(t.a,{href:"mailto:dojo@jataware.com",children:"dojo@jataware.com"})," for credentials or help with the application. From there you will be asked for basic metadata about your dataset."]}),"\n",(0,a.jsx)(t.admonition,{type:"note",children:(0,a.jsx)(t.p,{children:"Please provide as much information as possible throughout the data registration process to ensure that sufficient information is available to end-users of your dataset."})}),"\n",(0,a.jsx)(t.h3,{id:"metadata-capture",children:"Metadata capture"}),"\n",(0,a.jsx)(t.p,{children:"This form captures metadata about your data. There is a demonstration below, as well as definitions for each field:"}),"\n",(0,a.jsx)(t.p,{children:(0,a.jsx)(t.img,{alt:"Data Registration",src:i(67).Z+"",width:"1577",height:"840"})}),"\n",(0,a.jsx)(t.p,{children:"Model Overview Form Field Definitions:"}),"\n",(0,a.jsxs)(t.ul,{children:["\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.code,{children:"Name"}),": Name of the Dataset"]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.code,{children:"Description"}),": Your description here is the forward-facing documentation about your data that the end-user will see. Include as much information as possible to explain your data."]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.code,{children:"Category"}),": Add any over-arching categories that your data can be classified as; separate each category with a comma."]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.code,{children:"Resolution"}),":","\n",(0,a.jsxs)(t.ul,{children:["\n",(0,a.jsx)(t.li,{children:"Choose the applicable temporal resolution from the drop-down"}),"\n",(0,a.jsx)(t.li,{children:"Enter the X and Y resolution of your spatial data"}),"\n"]}),"\n"]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.code,{children:"Maintainer Information"}),":","\n",(0,a.jsxs)(t.ul,{children:["\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.code,{children:"Name"}),": The primary point of contact for the dataset."]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.code,{children:"Email"}),": The primary point of contact's e-mail address. If you have one, a group e-mail is also acceptable."]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.code,{children:"Organization"}),": The organization that created the dataset."]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.code,{children:"Website"}),": This can be a link to your dataset's repository or another website that you may maintain that provides additional context about your data."]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.code,{children:"File"}),": See ",(0,a.jsx)(t.a,{href:"data-registration/data-format",children:"preparing data for Dojo"})]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,a.jsx)(t.h2,{id:"geo-and-time-inference",children:"Geo and time inference"}),"\n",(0,a.jsxs)(t.p,{children:["Once you have uploaded your dataset, Dojo analyzes it to determine whether your dataset contains place or time information such as ",(0,a.jsx)(t.code,{children:"timestamps"}),", ",(0,a.jsx)(t.code,{children:"latitude"}),", ",(0,a.jsx)(t.code,{children:"longitude"}),", ",(0,a.jsx)(t.code,{children:"ISO"})," country codes, etc. This analysis process may take a few seconds, but it will ultimately speed up your data annotation."]}),"\n",(0,a.jsx)(t.h2,{id:"annotating-your-dataset",children:"Annotating your dataset"}),"\n",(0,a.jsxs)(t.p,{children:["Next, you will be shown a sample of your dataset. Columns highlighted in ",(0,a.jsx)("span",{style:{color:"rgb(51, 114, 136)"},children:(0,a.jsx)(t.strong,{children:"blue"})})," represent those which had a detected time or location feature."]}),"\n",(0,a.jsxs)(t.p,{children:["Click the ",(0,a.jsx)(t.strong,{children:"Annotate"})," button at the top of each column to annotate it."]}),"\n",(0,a.jsx)(t.admonition,{type:"tip",children:(0,a.jsx)(t.p,{children:"You should only annotate columns that you wish to retain in the final, transformed dataset."})}),"\n",(0,a.jsxs)(t.p,{children:["Once you've annotated a column it will be highlighted in ",(0,a.jsx)("span",{style:{color:"rgb(102, 187, 106)"},children:(0,a.jsx)(t.strong,{children:"green"})}),"."]}),"\n",(0,a.jsx)(t.p,{children:(0,a.jsx)(t.img,{alt:"Pre-Annotation",src:i(1811).Z+"",width:"1549",height:"798"})}),"\n",(0,a.jsxs)(t.p,{children:["You will be asked for a ",(0,a.jsx)(t.code,{children:"display name"})," and ",(0,a.jsx)(t.code,{children:"description"})," for your dataset. Additionally you will be asked whether this column is either ",(0,a.jsx)(t.code,{children:"Date"}),", ",(0,a.jsx)(t.code,{children:"Geo"}),", or a ",(0,a.jsx)(t.code,{children:"Feature"}),"."]}),"\n",(0,a.jsxs)(t.p,{children:["In the case of ",(0,a.jsx)(t.code,{children:"Date"})," and ",(0,a.jsx)(t.code,{children:"Geo"})," columns, they may be set to ",(0,a.jsx)(t.code,{children:"primary"}),". It is important to choose only one column to be the primary ",(0,a.jsx)(t.code,{children:"Date"})," and one to be the primary ",(0,a.jsx)(t.code,{children:"Geo"}),". In the case of a ",(0,a.jsx)(t.a,{href:"#build-a-date",children:"build a date"})," or ",(0,a.jsx)(t.a,{href:"#coordinate-pairs",children:"coordinate pairs"})," all relevant columns will be associated as ",(0,a.jsx)(t.code,{children:"primary"}),' if the user sets that "grouping" to be primary.']}),"\n",(0,a.jsx)(t.h3,{id:"date-formatting",children:"Date formatting"}),"\n",(0,a.jsx)(t.p,{children:'In the below example, the user annotates the "Year" column.'}),"\n",(0,a.jsx)(t.p,{children:(0,a.jsx)(t.img,{alt:"Pre-Annotation",src:i(3071).Z+"",width:"1164",height:"504"})}),"\n",(0,a.jsxs)(t.p,{children:["For date columns, the format is automatically detected Date formats are defined using the ",(0,a.jsx)(t.a,{href:"https://strftime.org/",children:"strftime"})," reference. Please refer to it for questions about how to correct or update the date format for a column. Generally, our column analysis process can correctly assign a date format, but periodically the user must update or correct this with an appropriate formatter. For example ",(0,a.jsx)(t.code,{children:"2020-02-01"})," would have the date format ",(0,a.jsx)(t.code,{children:"%Y-%m-%d"})," but ",(0,a.jsx)(t.code,{children:"Februrary 1, 2020"})," would be ",(0,a.jsx)(t.code,{children:"%B %-d, %Y"}),"."]}),"\n",(0,a.jsxs)(t.p,{children:["If the date formatter is incorrect the column preview will turn ",(0,a.jsx)("span",{style:{color:"#d32f2f"},children:(0,a.jsx)(t.strong,{children:"red"})})," until the user has corrected it."]}),"\n",(0,a.jsx)(t.h3,{id:"build-a-date",children:"Build a date"}),"\n",(0,a.jsxs)(t.p,{children:['Some datasets have year, month and day split out into separate columns. In this case, the user may "build a date" by annotating any of the relevant fields and indicating that it is ',(0,a.jsx)(t.code,{children:"part of a multi-column datetime object"}),"."]}),"\n",(0,a.jsx)(s.Z,{file:"build-a-date.png",title:"Build a Date"}),"\n",(0,a.jsx)(t.p,{children:"The user can then select the relevant year, month and day columns as well as ensure they have correct date formatters."}),"\n",(0,a.jsx)(t.h3,{id:"coordinate-pairs",children:"Coordinate pairs"}),"\n",(0,a.jsxs)(t.p,{children:["Generally speaking, if a dataset has latitude and longitude in it we should annotate this and ignore the other geospatial information (unless they are ",(0,a.jsx)(t.a,{href:"#qualifiers",children:"qualifiers"}),") as this is the most granular location information available and can be used to geocode the remainder of the dataset."]}),"\n",(0,a.jsxs)(t.p,{children:["However, latitude and longitude are not typically contained in the same column. So, we provide a mechanism for the user to associate a ",(0,a.jsx)(t.code,{children:"latitude"})," with a ",(0,a.jsx)(t.code,{children:"longitude"})," and vice versa. To do this, you indicate that the column ",(0,a.jsx)(t.code,{children:"is part of a coordinate pair"})," and choose its partner from the dropdown."]}),"\n",(0,a.jsx)(s.Z,{file:"coordinate-pair.png",title:"Coordinate Pair"}),"\n",(0,a.jsx)(t.h3,{id:"multi-part-geographies",children:"Multi-part geographies"}),"\n",(0,a.jsxs)(t.p,{children:["If a dataset has geographies that correspond to ",(0,a.jsx)(t.code,{children:"country"}),", ",(0,a.jsx)(t.code,{children:"admin1"}),", ",(0,a.jsx)(t.code,{children:"admin2"}),", and ",(0,a.jsx)(t.code,{children:"admin3"}),", these should be added ",(0,a.jsx)(t.strong,{children:"without"})," flagging as ",(0,a.jsx)(t.code,{children:"primary_geo"}),"."]}),"\n",(0,a.jsxs)(t.blockquote,{children:["\n",(0,a.jsxs)(t.p,{children:["If any of these are flagged as ",(0,a.jsx)(t.code,{children:"primary_geo"}),", then the remaining geographies will be added as ",(0,a.jsx)(t.code,{children:"features"}),"."]}),"\n"]}),"\n",(0,a.jsx)(t.p,{children:"For example, if the dataset includes:"}),"\n",(0,a.jsxs)(t.table,{children:[(0,a.jsx)(t.thead,{children:(0,a.jsxs)(t.tr,{children:[(0,a.jsx)(t.th,{children:"ADMIN0"}),(0,a.jsx)(t.th,{children:"ADMIN1"}),(0,a.jsx)(t.th,{children:"ADMIN2"})]})}),(0,a.jsxs)(t.tbody,{children:[(0,a.jsxs)(t.tr,{children:[(0,a.jsx)(t.td,{children:"Djibouti"}),(0,a.jsx)(t.td,{children:"Dikhi"}),(0,a.jsx)(t.td,{children:"Yoboki"})]}),(0,a.jsxs)(t.tr,{children:[(0,a.jsx)(t.td,{children:"Djibouti"}),(0,a.jsx)(t.td,{children:"Obock"}),(0,a.jsx)(t.td,{children:"Obock"})]})]})]}),"\n",(0,a.jsx)(t.p,{children:"and the following assignments are made:"}),"\n",(0,a.jsxs)(t.ul,{children:["\n",(0,a.jsxs)(t.li,{children:["ADMIN0 ",(0,a.jsx)(t.em,{children:"Type"}),": ",(0,a.jsx)(t.code,{children:"Geo"})," ",(0,a.jsx)(t.em,{children:"Format"}),": ",(0,a.jsx)(t.code,{children:"Country"})," ",(0,a.jsx)(t.em,{children:(0,a.jsx)(t.code,{children:"This is my primary geo field"})})]}),"\n",(0,a.jsxs)(t.li,{children:["ADMIN1 ",(0,a.jsx)(t.em,{children:"Type"}),": ",(0,a.jsx)(t.code,{children:"Geo"})," ",(0,a.jsx)(t.em,{children:"Format"}),": ",(0,a.jsx)(t.code,{children:"State/Territory"})]}),"\n",(0,a.jsxs)(t.li,{children:["ADMIN2 ",(0,a.jsx)(t.em,{children:"Type"}),": ",(0,a.jsx)(t.code,{children:"Geo"})," ",(0,a.jsx)(t.em,{children:"Format"}),": ",(0,a.jsx)(t.code,{children:"Country/District"})]}),"\n"]}),"\n",(0,a.jsxs)(t.p,{children:["the ",(0,a.jsx)(t.em,{children:"Preview"})," will display results similar to:"]}),"\n",(0,a.jsxs)(t.table,{children:[(0,a.jsx)(t.thead,{children:(0,a.jsxs)(t.tr,{children:[(0,a.jsx)(t.th,{children:"country"}),(0,a.jsx)(t.th,{children:"admin1"}),(0,a.jsx)(t.th,{children:"admin2"}),(0,a.jsx)(t.th,{children:"feature"}),(0,a.jsx)(t.th,{children:"value"})]})}),(0,a.jsxs)(t.tbody,{children:[(0,a.jsxs)(t.tr,{children:[(0,a.jsx)(t.td,{children:"Djibouti"}),(0,a.jsx)(t.td,{children:"NAN"}),(0,a.jsx)(t.td,{children:"NAN"}),(0,a.jsx)(t.td,{children:"ADMIN2"}),(0,a.jsx)(t.td,{children:"Yoboki"})]}),(0,a.jsxs)(t.tr,{children:[(0,a.jsx)(t.td,{children:"Djibouti"}),(0,a.jsx)(t.td,{children:"NAN"}),(0,a.jsx)(t.td,{children:"NAN"}),(0,a.jsx)(t.td,{children:"ADMIN1"}),(0,a.jsx)(t.td,{children:"Obock"})]})]})]}),"\n",(0,a.jsxs)(t.p,{children:["if instead the following assignments are made where no field is marked ",(0,a.jsx)(t.code,{children:"primary_geo"}),":"]}),"\n",(0,a.jsxs)(t.ul,{children:["\n",(0,a.jsxs)(t.li,{children:["ADMIN0 ",(0,a.jsx)(t.em,{children:"Type"}),": ",(0,a.jsx)(t.code,{children:"Geo"})," ",(0,a.jsx)(t.em,{children:"Format"}),": ",(0,a.jsx)(t.code,{children:"Country"})]}),"\n",(0,a.jsxs)(t.li,{children:["ADMIN1 ",(0,a.jsx)(t.em,{children:"Type"}),": ",(0,a.jsx)(t.code,{children:"Geo"})," ",(0,a.jsx)(t.em,{children:"Format"}),": ",(0,a.jsx)(t.code,{children:"State/Territory"})]}),"\n",(0,a.jsxs)(t.li,{children:["ADMIN2 ",(0,a.jsx)(t.em,{children:"Type"}),": ",(0,a.jsx)(t.code,{children:"Geo"})," ",(0,a.jsx)(t.em,{children:"Format"}),": ",(0,a.jsx)(t.code,{children:"Country/District"})]}),"\n"]}),"\n",(0,a.jsxs)(t.p,{children:["the ",(0,a.jsx)(t.em,{children:"Preview"})," will display results similar to:"]}),"\n",(0,a.jsxs)(t.table,{children:[(0,a.jsx)(t.thead,{children:(0,a.jsxs)(t.tr,{children:[(0,a.jsx)(t.th,{children:"country"}),(0,a.jsx)(t.th,{children:"admin1"}),(0,a.jsx)(t.th,{children:"admin2"})]})}),(0,a.jsxs)(t.tbody,{children:[(0,a.jsxs)(t.tr,{children:[(0,a.jsx)(t.td,{children:"Djibouti"}),(0,a.jsx)(t.td,{children:"Dikhi"}),(0,a.jsx)(t.td,{children:"Yoboki"})]}),(0,a.jsxs)(t.tr,{children:[(0,a.jsx)(t.td,{children:"Djibouti"}),(0,a.jsx)(t.td,{children:"Obock"}),(0,a.jsx)(t.td,{children:"Obock"})]})]})]}),"\n",(0,a.jsx)(t.h3,{id:"qualifiers",children:"Qualifiers"}),"\n",(0,a.jsxs)(t.p,{children:["Many datasets contain features that ",(0,a.jsx)(t.em,{children:"qualify"}),' other features. For example, in a conflict/event dataset such as ACLED, you may have a category for the type of event. The primary feature associated with the event may be number of fatalities, while the category "qualifies" the number of fatalities.']}),"\n",(0,a.jsx)(s.Z,{file:"qualifiers.png",title:"Qualifiers"}),"\n",(0,a.jsxs)(t.p,{children:["To set ",(0,a.jsx)(t.code,{children:"Event Type"})," as a ",(0,a.jsx)(t.em,{children:"qualifier"})," for ",(0,a.jsx)(t.code,{children:"fatalities"})," the user should check the box indicating that ",(0,a.jsx)(t.code,{children:"this field qualifies another"}),". The user should then select the relevant columns that the current feature qualifies. One field may qualify many features; in this case select all relevant features that the field of interest qualifies."]}),"\n",(0,a.jsx)(t.admonition,{type:"tip",children:(0,a.jsxs)(t.p,{children:["You should only ",(0,a.jsx)(t.em,{children:"qualify"})," other features, not ",(0,a.jsx)(t.code,{children:"Geo"})," or ",(0,a.jsx)(t.code,{children:"Date"}),' information since those are inherently dataset qualifiers. This avoids "qualifying a qualifier."']})}),"\n",(0,a.jsx)(t.h3,{id:"add-alias",children:"Add Alias"}),"\n",(0,a.jsxs)(t.p,{children:['The "Add Alias" feature allows you to replace specific cell values within your selected column. This tool enhances ',(0,a.jsx)(t.code,{children:"Feature"})," data - data that is not ",(0,a.jsx)(t.code,{children:"Geo"})," or ",(0,a.jsx)(t.code,{children:"Date"})," - to help provide more consistent representation after the dataset has been processed."]}),"\n",(0,a.jsx)(s.Z,{file:"dataset-add-alias.png",title:"Add Alias",width:"500px"}),"\n",(0,a.jsx)(t.p,{children:"First, click the blue 'Add Alias' button. Then you'll see the Current and New value fields. Both fields are required to save the alias, or you'll have to remove the partially completed alias before you can save your annotation."}),"\n",(0,a.jsxs)(t.ul,{children:["\n",(0,a.jsx)(t.li,{children:"Current Value: The original cell value."}),"\n",(0,a.jsx)(t.li,{children:"New Value: The value that will replace the current one."}),"\n"]}),"\n",(0,a.jsx)(t.p,{children:"For example, if your dataset includes a column with values like 'undefined', 'N/A', or 'null', these can be substituted:"}),"\n",(0,a.jsxs)(t.ul,{children:["\n",(0,a.jsx)(t.li,{children:"Current: undefined"}),"\n",(0,a.jsx)(t.li,{children:"New: 0"}),"\n"]}),"\n",(0,a.jsx)(t.p,{children:"Here, all 'undefined' values will be replaced with '0'."}),"\n",(0,a.jsx)(t.h2,{id:"feature-statistics",children:"Feature Statistics"}),"\n",(0,a.jsx)(t.p,{children:"The feature annotation component includes a statistics tab. When expanded, this tab provides a variety of descriptive statistics about the feature including:"}),"\n",(0,a.jsxs)(t.ul,{children:["\n",(0,a.jsx)(t.li,{children:"the distribution of the feature (via a histogram)"}),"\n",(0,a.jsx)(t.li,{children:"count"}),"\n",(0,a.jsx)(t.li,{children:"min, median, max as well as percentiles"}),"\n",(0,a.jsx)(t.li,{children:"for string features, the mode is provided"}),"\n"]}),"\n",(0,a.jsx)(t.p,{children:"These statistics are intended to provide the user the ability to perform quality checks of the data they are annotating."}),"\n",(0,a.jsx)(t.p,{children:(0,a.jsx)(t.img,{alt:"Stats",src:i(3477).Z+"",width:"1361",height:"801"})}),"\n",(0,a.jsx)(t.h2,{id:"manual-data-transformations",children:"Manual Data Transformations"}),"\n",(0,a.jsx)(t.p,{children:"Before we process your dataset, you can pare down your data with our manual Data Transformations step. Some large datasets may take a long time in the processing step, so if some of the information contained is not relevant (e.g. the dataset covers 1990-2020, and you are only concerned with 2000-2020), you can use our transformation tools to do a few select adjustments to speed up the process. You can choose to do as many or as few of these as you'd like."}),"\n",(0,a.jsx)(s.Z,{file:"transform-data.png",title:"Transformation Step",width:"600px"}),"\n",(0,a.jsxs)(t.p,{children:["For each transformation, after you've made your selections, you'll be able to preview what effect your changes will have on the dataset with the Preview panel under the tool. Make your changes and the ",(0,a.jsx)(t.strong,{children:"Preview"})," button should become enabled (except in the case of Temporal Coverage, where you'll need to click 'Crop Coverage' before the Preview button will work)."]}),"\n",(0,a.jsx)(s.Z,{file:"transformation-preview.png",title:"Transformation Preview"}),"\n",(0,a.jsxs)(t.p,{children:["None of the changes in the transformation panels will take effect until you click ",(0,a.jsx)(t.strong,{children:"NEXT"})," at the bottom of the page."]}),"\n",(0,a.jsx)(t.p,{children:"If your dataset meets certain qualifications, you can do the following:"}),"\n",(0,a.jsx)(t.h3,{id:"adjust-geospatial-resolution",children:"Adjust Geospatial Resolution"}),"\n",(0,a.jsx)(t.p,{children:"If your dataset has uniform geospatial data, you can use this tool to expand the geospatial resolution. You will also need to select one of the following aggregation functions:"}),"\n",(0,a.jsxs)(t.ul,{children:["\n",(0,a.jsx)(t.li,{children:"Conservative: Conservative remapping, suitable for preserving the total value of the field (e.g., mass, population, water fluxes)."}),"\n",(0,a.jsx)(t.li,{children:"Sum: Sum remapping, suitable for fields representing accumulated quantities (e.g., precipitation, snowfall, radiation fluxes)."}),"\n",(0,a.jsx)(t.li,{children:"Minimum: Minimum remapping, suitable for fields where you want to preserve the minimum value within an area (e.g., minimum temperature, lowest pressure)."}),"\n",(0,a.jsx)(t.li,{children:"Maximum: Maximum remapping, suitable for fields where you want to preserve the maximum value within an area (e.g., peak wind speeds, maximum temperature)."}),"\n",(0,a.jsx)(t.li,{children:"Median: Median remapping, suitable for fields where you want to preserve the central tendency of the data, while being less sensitive to extreme values (e.g., median income, median precipitation)."}),"\n",(0,a.jsx)(t.li,{children:"Average: Average remapping, suitable for fields representing average quantities (e.g., temperature, humidity, wind speed)."}),"\n",(0,a.jsx)(t.li,{children:"Bilinear: Bilinear interpolation, suitable for smooth fields (e.g., temperature, pressure, geopotential height)."}),"\n",(0,a.jsx)(t.li,{children:"Bicubic: Bicubic interpolation, suitable for smooth fields with higher-order accuracy (e.g., temperature, pressure, geopotential height)."}),"\n",(0,a.jsx)(t.li,{children:"Nearest Neighbor: Nearest neighbor remapping, suitable for categorical data (e.g., land use types, soil types, vegetation types)."}),"\n"]}),"\n",(0,a.jsx)(t.h3,{id:"select-geospatial-coverage",children:"Select Geospatial Coverage"}),"\n",(0,a.jsx)(t.p,{children:"With this tool you can draw shapes on a map to clip your geospatial data."}),"\n",(0,a.jsx)(t.h3,{id:"adjust-temporal-coverage",children:"Adjust Temporal Coverage"}),"\n",(0,a.jsx)(t.p,{children:"If your dataset has uniform temporal coverage, this tool can change the temporal resolution (e.g. from day to weekly). Similar to geospatial resolution, you will need to select one of the following aggregation functions:"}),"\n",(0,a.jsxs)(t.ul,{children:["\n",(0,a.jsx)(t.li,{children:"Count"}),"\n",(0,a.jsx)(t.li,{children:"Size"}),"\n",(0,a.jsx)(t.li,{children:"Sum"}),"\n",(0,a.jsx)(t.li,{children:"Mean"}),"\n",(0,a.jsx)(t.li,{children:"Std"}),"\n",(0,a.jsx)(t.li,{children:"Var"}),"\n",(0,a.jsx)(t.li,{children:"Sem"}),"\n",(0,a.jsx)(t.li,{children:"Min"}),"\n",(0,a.jsx)(t.li,{children:"Max"}),"\n",(0,a.jsx)(t.li,{children:"First"}),"\n",(0,a.jsx)(t.li,{children:"Last"}),"\n"]}),"\n",(0,a.jsx)(t.h3,{id:"select-temporal-coverage",children:"Select Temporal Coverage"}),"\n",(0,a.jsx)(t.p,{children:"This tool allows you to select new start and end dates to crop the time that your dataset covers."}),"\n",(0,a.jsx)(t.h2,{id:"processing-the-dataset",children:"Processing the dataset"}),"\n",(0,a.jsxs)(t.p,{children:["When you have finished annotating your dataset you should have at least one feature annotated as well as a primary geography and date. If no primary ",(0,a.jsx)(t.code,{children:"Date"})," or ",(0,a.jsx)(t.code,{children:"Geo"})," information was provided, we do our best to identify what ",(0,a.jsx)(t.em,{children:"might"})," have been ",(0,a.jsx)(t.code,{children:"primary"})," based on the user's annotations."]}),"\n",(0,a.jsx)(t.p,{children:"We then transform the dataset into a ready-to-use format. This process may take some time, depending on what is required. If the dataset is quite large and requires reverse geocoding latitude and longitudes into admin 0 through 3 (using GADM) it could take up to a few minutes."}),"\n",(0,a.jsxs)(t.p,{children:["After the dataset has been transformed a preview will be shown in the ready-to-use format. If the dataset is large, a random sample of 100 rows is taken to allow the user to spot check accuracy. All ",(0,a.jsx)(t.code,{children:"features"}),' are "stacked" on top of each other. Qualifiers are added as additional columns to the right.']}),"\n",(0,a.jsx)(t.p,{children:(0,a.jsx)(t.img,{alt:"Preview",src:i(5330).Z+"",width:"1530",height:"1208"})}),"\n",(0,a.jsxs)(t.p,{children:["During this step, we attempt to automatically normalize all place names to the ",(0,a.jsx)(t.a,{href:"https://gadm.org/",children:"GADM standard"}),". If your dataset contained columns for things like country, admin 1, ISO codes, etc we perform entity resolution behind-the-scenes to ensure that the place name spelling matches GADM. This ensures consistent place naming for downstream data consumers."]}),"\n",(0,a.jsxs)(t.p,{children:["If everything looks good the user can download this table if they wish. To save their work, the user ",(0,a.jsxs)(t.strong,{children:["must ",(0,a.jsx)(t.code,{children:"Submit to Dojo"})]}),". Upon success the user can register another dataset or view the final metadata in Dojo."]})]})}function u(e={}){const{wrapper:t}={...(0,n.a)(),...e.components};return t?(0,a.jsx)(t,{...e,children:(0,a.jsx)(h,{...e})}):h(e)}},4285:(e,t,i)=>{i.d(t,{Z:()=>s});i(7294);var a=i(4996),n=i(5893);function s(e){let{width:t,file:i,title:s}=e;return(0,n.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center"},children:[(0,n.jsx)("img",{src:(0,a.Z)(`/img/${i}`),width:t,alt:s}),(0,n.jsx)("p",{children:(0,n.jsx)("i",{children:s})})]})}},67:(e,t,i)=>{i.d(t,{Z:()=>a});const a=i.p+"assets/images/data_registration-94709cc332490d3c543827bb2e14d5c0.png"},1811:(e,t,i)=>{i.d(t,{Z:()=>a});const a=i.p+"assets/images/pre-annotate-33b01b684de6899379c3bf3055221797.png"},5330:(e,t,i)=>{i.d(t,{Z:()=>a});const a=i.p+"assets/images/preview-d9720e21d96154444f423702bdcbbc4f.png"},3477:(e,t,i)=>{i.d(t,{Z:()=>a});const a=i.p+"assets/images/stats-706dd941989210fc4d4c5cbf652be17a.png"},3071:(e,t,i)=>{i.d(t,{Z:()=>a});const a=i.p+"assets/images/year-24392e1ab9402cd4a749380fda6c0df7.png"},1151:(e,t,i)=>{i.d(t,{Z:()=>o,a:()=>r});var a=i(7294);const n={},s=a.createContext(n);function r(e){const t=a.useContext(s);return a.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function o(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(n):e.components||n:r(e.components),a.createElement(s.Provider,{value:t},e.children)}}}]);
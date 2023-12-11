---
layout: default
title: Preparing data for Dojo
parent: Data Registration
---

# Preparing data for Dojo

Dojo can accept `CSV`, `Excel`, `GeoTIFF` and `NetCDF` files. When you initially upload a file you may be presented with a set of options depending upon the detected file type. Dojo is **not** a data cleaning platform; your data should be clean prior to registering it to Dojo.

## Tabular data

If your data is a `CSV` or `Excel` file it is considered to be tabular. Tabular data must be provided in a **clean** format. If your file has extraneous rows or columns, includes arbitrary linebreaks (e.g. for human readability) or is otherwise malformed it should be cleaned up in Excel before registering it to Dojo.

Additionally, you should consider removing any extraneous columns (if your data is in CSV or Excel file) before uploading it to Dojo to simplify your annotation task within Dojo.

Tabular data must have one column per feature. For example, a table that looks like this would be acceptable:

| Year | Country  | Crop_Index |
|------|----------|------------|
| 2015 | Djibouti | 0.7        |
| 2016 | Djibouti | 0.8        |
| 2017 | Djibouti | 0.9        |

However, a transposed dataset where time is represented by columns such as the following would be unacceptable:

| Country  | 2015 | 2016 | 2017 |
|----------|------|------|------|
| Djibouti | 0.7  | 0.8  | 0.9  |
| Eritrea  | 0.6  | 0.7  | 0.9  |

A dataset such as the above should be transformed by the user beforehand_ so that each item of interest has its own column. Datasets with line breaks or non-standardized formatting are unacceptable for registration to Dojo. 

For example this dataset **cannot be registered to Dojo as is**:

| **Survey 1** 	|          	| **_Notes: survey collected by 3rd party enumerator_** 	|
|----------	|----------	|-------------------------------------------------	|
| Year     	| Country  	| Crop_Index                                      	|
| 2015     	| Djibouti 	| 0.7                                             	|
| 2016     	| Djibouti 	| 0.8                                             	|
|          	|          	|                                                 	|
|          	|          	|                                                 	|
| **Survey 2** 	|          	| **_Notes: survey collected by World Bank_**           	|
| Year     	| Country  	| Fertilizer_Index                                	|
| 2015     	| Djibouti 	| 1.8                                             	|
| 2015     	| Eritrea  	| 2.1                                             	|

Prior to registration, it should be cleaned and converted to the below format before registration to Dojo:

| Survey_Number 	| Year 	| Country  	| Crop_Index 	| Fertilizer_Index 	| Notes                                     	|
|---------------	|------	|----------	|------------	|------------------	|-------------------------------------------	|
| 1             	| 2015 	| Djibouti 	| 0.7        	|                  	|  survey collected by 3rd party enumerator 	|
| 1             	| 2016 	| Djibouti 	| 0.8        	|                  	| survey collected by 3rd party enumerator  	|
| 2             	| 2015 	| Djibouti 	|            	| 1.8              	| survey collected by World Bank            	|
| 2             	| 2015 	| Eritrea  	|            	| 2.1              	| survey collected by World Bank            	|

Alternatively, a format like the following will be acceptable by Dojo:

| Survey_Number 	| Year 	| Country  	| Index_Name       	| Index_Value 	| Notes                                     	|
|---------------	|------	|----------	|------------------	|-------------	|-------------------------------------------	|
| 1             	| 2015 	| Djibouti 	| Crop Index       	| 0.7         	|  survey collected by 3rd party enumerator 	|
| 1             	| 2016 	| Djibouti 	| Crop Index       	| 0.8         	| survey collected by 3rd party enumerator  	|
| 2             	| 2015 	| Djibouti 	| Fertilizer Index 	| 1.8         	| survey collected by World Bank            	|
| 2             	| 2015 	| Eritrea  	| Fertilizer Index 	| 2.1         	| survey collected by World Bank            	|


Excel files require that you select a worksheet. If your file is large, please wait until you see the detected worksheet names and select the appropriate one.  When uploading an `Excel` file, you will be asked to select the sheet of interest. Currently Dojo only supports registering one sheet at a time.

<p align="center">
    <img src="../imgs/excel_sheet.png" width="400" title="Excel sheet selector"/>
    <br/>
    <i>Excel sheet selector</i>
</p>

## Other formats

Data preparation for Dojo is less an issue for other acceptable formats. If your dataset is a `GeoTIFF`, you will be asked to provide the data band you wish to process and the name of the feature that resides in that band. You may optionally provide a date for the respective band and the value used by the `GeoTIFF` for nulls.

`NetCDF` files should be well formed and comply with the `NetCDF` standard.
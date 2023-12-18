---
layout: default
title: Cheatsheet
parent: Model Registration
---

# Dojo Terminal commands
There are a handful of Dojo specific commands that you must use inside the Dojo containerization environment/terminal emulator to successfully register your model. 

```
$ dojo
dojo command line utility

Usage:
  dojo [command]

Available Commands:
  annotate    tags an output file and opens the web output file annotation tool
  config      Opens the web configuration file annotation tool
  edit        Edit this file in the web editor
  help        Help about any command
  tag         Tags an output accessory file such as an image or video
  version     Print Version

Flags:
  -h, --help      help for dojo
  -v, --verbose   verbose output

Use "dojo [command] --help" for more information about a command.
```

### Example usage:

`dojo annotate`: 
```
$ dojo annotate Output_Files/Case1_0D-u.nc
```

`dojo config`: 
```
$ dojo config calibrate_cfg_files/calibrate_Ankush.cfg 
Opening config for calibrate_cfg_files/calibrate_Ankush.cfg
```

`dojo edit`:
```
$ dojo edit TopoFlow_Calibration_Baro_at_Masha.ipynb 
Launching editor /home/clouseau/topoflow36/TopoFlow_Calibration_Baro_at_Masha.ipynb
```

`dojo tag`: 
```
$ dojo tag images/Akado1_2016-10-10_Google_Earth.png "Akado 1, 10.10.2016"
Tagged images/Akado1_2016-10-10_Google_Earth.png
```
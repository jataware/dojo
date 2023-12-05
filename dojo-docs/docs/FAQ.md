---
layout: default
title: Frequently Asked Questions
---

# Dojo / World Modelers FAQ

 **1. Will my model be a good fit for running in Dojo?**
 
 > To be a good fit for Dojo your model should be able to run in a Debian/Ubuntu based environment.

 > It is also useful, but not necessary, to make the most relevant input parameters perturbable before the model run which allows analysts to run “what-if” scenarios with your model.

 >  Another useful practice when preparing a model for dojo is to move all configuration settings to a configuration file.

 **2. Can I register Windows applications/models?**

> At this time, no, Windows applications cannot be registered in Dojo

 **3. What if my data doesn’t have a temporal or geospatial dimension?**
 
 > Data should have temportal or a geospatial dimension. If the data is current you can add the current year to the data so it will fit with the required geotemporal format. 

 **4. Running my model requires X number of steps, but there’s only one
    directive, how can I make this work?**

> Frequently, this can be resolved by wrapping your steps in a simple bash script, and the bash script can be set as the directive

 **5. What if I need to download the latest data for each model run?**

> It is possible to to use curl or wget to download data, or to do so directly in your model code, but this is generally not recommended as broken download links is one of the most common causes of failure when running models.

 **6. What if my code and/or model is not allowed to be shared with the
    public?**
> Hold off on registering the model until you talk with us. Dojo's current workflow will publish a public docker image of the model to dockerhub, so it would be possible for someone to access the code or data within that image. 

 **7. How do I cite Dojo in papers?**
 
 >Jataware (2022). Dojo: Dojo modeling is a repository for registering, storing, and running data-science models. Washington DC, United States. Available from: https://github.com/dojo-modeling/dojo.

 **8. What if I need to make changes to the model in the future?**

> Dojo utilizes a versioning system where once a model is published it becomes unchangeable. However at any point you can create a new version of the model, cloning the existing model into a brand new model. Publishing this clone replaces the previous version of the model for purposes or running.

 **9. What languages can my model be written in?**

> Dojo is language agnostic, as long as the resulting binaries or code can be executed in a Debian/Ubuntu based environment. During model registration modelers can install any required runtimes or libraries needed.

 **10. What data file formats can Dojo process?**
 > Dojo supports excel, csv, geotiff, shapefiles, and netcdf output files.

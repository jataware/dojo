---
layout: default
title: MATLAB Models
parent: Model Registration
---

# Registering MATLAB Models in Dojo
MATLAB is a proprietary software that requires a license to use. This presents a challenge to registering models into an environment where there is no software license for MATLAB. Conveniently, MATALB offers the option to compile model code into an executable that can be run using the MATLAB Runtime. MATLAB Runtime does not reqiure a MATLAB software license. To register a MATLAB model to Dojo it must first be compiled, then executed using the Runtime.

## Compiling MATLAB models
MATLAB has a comprehensive guide to compiling its code [available here](https://www.mathworks.com/help/compiler/create-and-install-a-standalone-application-from-matlab-code.html). The most streamlined way to compile a model written in MATLAB is:

1. Select the main executable for the model
2. Set `Runtime downloaded from web`
3. Select `package`
4. Use the `for_redistribution_files_only` directory that the packaging process created. This contains the compiled model code and files.

## Running the compiled model
To run the compiled model locally, you need to download MATLAB Runtime, which is [available here](https://www.mathworks.com/products/compiler/matlab-runtime.html). Next you should execute the `.sh` file stored to `build` and provide the path of the MATLAB Runtime executable. 

> Note: you must execute the compiled model in the same environment that it was compiled. Since Dojo relies on Linux, you must compile your model in a Linux environment.

An example run of the compiled code may look like:

```
build/run_model.sh /usr/local/MATLAB/MATLAB_Runtime/v912
```

## Registering the compiled model
When selecting the base container during the provisioning step of model registration, select `MATLAB` from the dropdown. This has the MATLAB Runtime pre-installed at `/usr/local/MATLAB/MATLAB_Runtime/v912`. Now, you should run your compiled model and specify the parameters as you would normally. The Runtime will be able to execute the model and you can proceed annotating parameters, outputs, and media as you would normally.
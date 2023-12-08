---
layout: default
title: CLI Commands
parent: Model Execution
---

# Dojo CLI commands
The [Dojo CLI](https://github.com/dojo-modeling/dojo-cli) is a tool to use outside the Dojo ecosystem to execute Dojo models. You can install it anywhere Docker is installed and execute all models registered to Dojo with custom parameters. It's commands are:

| Command   	| Description                                                   	| Example Usage          	|
|-----------	|---------------------------------------------------------------	|------------------------	|
|`dojo describe`    | Print a description of the model  | `dojo describe --model=Population-Model` |
|`dojo listmodels`  | List available models | `dojo listmodels` |
|`dojo outputs`     | Print descriptions of the output and accessory files produced by a model  | `dojo outputs --model=Topoflow` |
|`dojo parameters`  | Print the parameters required to run a model  | `dojo parameters --model=CHIRPS-Monthly` |
|`dojo results`     | Get the results of a model finished running detached  |`dojo results --name=dojo-mymodel20211225133418` |
|`dojo runmodel`    | Run a model   | `dojo runmodel --model="CHIRPS-Monthly" --params='{"month": "09", "year": "2016", "bounding_box": "[[33.512234, 2.719907], [49.98171,16.501768]]"}'` |
|`dojo versions`    | List all versions of a model  | `dojo versions --model=CHIRPS-Monthly` |

> Note: [Further dojo-cli documentation](https://github.com/dojo-modeling/dojo-cli)

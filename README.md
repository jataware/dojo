

![Clouseau](docs/clouseau.png)

![Build](https://github.com/jataware/clouseau/workflows/Build/badge.svg)

v2.0.1


## Demo

https://user-images.githubusercontent.com/969727/115638877-3bd3a700-a2e1-11eb-8f08-d3c9fa5907f0.mp4

```
go  v1.16.3
node v15.14.0
npm v7.7.6
```


## Setup
```
make docker_build
```

Add Docker Hub Auth Token to `.dockerenv` and `claudine/server/.env`

Generate base64 auth token
```
echo '{"username":"<username>","password":"<password>","email":"<email>"}' | base64
```

```
DOCKERHUB_AUTH=<auth token>
```


## Run
```
make socat-start
make docker-compose_up
```

### lint
```
make go_fmt
make npm_lint
```

### Build
```
make go_build
make npm_build
```


## Run Dev

Start docker proxy
```
make socat-start
```

Start server
```
make cato_run_dev
```

Start UI
```
(cd ui && npm i)
make npm_run_dev
```

open [http://localhost:8080](http://localhost:8080)



### Bump Version

Install [bump2version](https://github.com/c4urself/bump2version)

```
bump2version --current-version <current-version> --new-version <new-version>  major|minor  --allow-dirty
```

Review changes and commit

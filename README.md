

![Clouseau](docs/clouseau.png)

![Build](https://github.com/jataware/clouseau/workflows/Build/badge.svg)

v2.2.0


## Demo

https://user-images.githubusercontent.com/969727/115638877-3bd3a700-a2e1-11eb-8f08-d3c9fa5907f0.mp4

```
go  v1.16.3
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
```

### Build
```
make go_build
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

### Bump Version

Install [bump2version](https://github.com/c4urself/bump2version)

```
bump2version --current-version <current-version> --new-version <new-version>  major|minor  --allow-dirty
```

Review changes and commit

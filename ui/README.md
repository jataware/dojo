

![Dojo UI](docs/pinkpanther.jpg)

![Build](https://github.com/jataware/phantom/workflows/Build/badge.svg)

v1.0.0

## Dependencies

```
node v15.14.0
npm v7.7.6
```

## Setup
```
make docker_build
```

### lint
```
make npm_lint
```

### Build
```
make npm_build
```

## Run Dev

Start UI
```
(cd ui && npm i)
make npm_run_dev
```

Navigate to [http://localhost:8080](http://localhost:8080) on your browser.


### Bump Version

Install [bump2version](https://github.com/c4urself/bump2version)

```
bump2version --current-version <current-version> --new-version <new-version>  major|minor  --allow-dirty
```

Review changes and commit

### Testing

You can open the cypress integration test runner app with:
```
make cypress_open
```

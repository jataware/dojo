# Uncharted Auth with a Gateway

### Keycloak with Apache httpd as application gateway

This approach details using Apache httpd as a gateway that can be the only point of Authentication and Authorization.  Ideally the API services check for a valid *access token* and confirm the roles granted by confering with Keycloak.

The build uses the docker experimental building tool `buildx` which might need to be enabled, this is to compile *mod_auth_openidc* for the M1 chipset (arm64) in addition to the packaged amd64 distribution.

`docker buildx create`

To use `build.sh` please provide the *platform* to be built: `amd64` (default), or `arm64`.

TODO: build both variants and have them pulled correctly based on system needs.

### Usage Instructions

edit `docker-compose.yml` altering the environment variables for the following entries (NB: host.docker.internal is "localhost" from a Mac or Windows machine's Docker envionment's point of view):

- CLIENT_SERVICE_URL=http://host.docker.internal:8080/
- API_SERVICE_ENDPOINT=/api/
- API_SERVICE_URL=http://host.docker.internal:3000/api/

TODO: instructions how to server static content instead of a CLIENT_SERVICE_URL

`./build.sh <platform>`

`docker-compose -f docker-compose-import.yml up`

Once the import has completed (with Keycloak exiting), then run:

`docker-compose up`

The application is now ready to use.

Visit `http://localhost:8079` to interact directly with Keycloak UID:PWD - `admin:openidctest`

Visit `http://localhost:8078` to use causemos.

TODO: change hardcoded "causemos" path on landing page

### Additional Files

The file *docker-compose-init.yml* is to help create a new database from scratch (assuming the PostGres container has been erased), this might no longer be necessary.

The file *docker-compose-import.yml* is to import all the Realms and Users into Keycloak.

The file *docker-compose-export.yml* is to export all the Realms and Users from Keycloak for import if there is no data when Keycloak is launched.

The directory *html-ajax* contains the web site served by the Gateway.

The directory *httpd-openidc* is the gateway.

The directory *realm-data* is the example exported Keycloak data for import into an empty database.

The directory *uncharted-keycloak* is the Keycloak server configured for running in SSL and using PostGres.

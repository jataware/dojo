if [[ ! -z $1 ]]; then
    if [ "$1" = "-h" ]; then
        echo "specify platform type:"
        echo "  arm64        for M1 macs"
        echo "  amd64        for most other platforms"
    else
        PLATFORM=${1}
    fi
fi

if [ ${SSL_BUILD:-0} -gt 0 ]; then
    echo "Generate new certificate for testing SSL"
    minica -domains keycloak,auth.private.dev,causemos.private.dev

    echo "Copy the certificates to the containers being built"
    mkdir uncharted-keycloak/certificates/
    cp -R keycloak/cert.pem uncharted-keycloak/certificates/both-cert.pem
    cp -R keycloak/key.pem uncharted-keycloak/certificates/both-key.pem

    mkdir httpd-openidc/certificates
    cp -R keycloak/cert.pem httpd-openidc/certificates/both-cert.pem
    cp -R keycloak/key.pem httpd-openidc/certificates/both-key.pem
fi

echo "\nBuild Apache HTTPD server\n"
docker buildx build -t docker-hub.uncharted.software/auth/httpd-openidc --platform linux/${PLATFORM:-amd64} --load httpd-openidc

echo "\nBuild Keycloak server\n"
cd uncharted-keycloak; docker build . -t docker-hub.uncharted.com/auth/keycloak; cd ..

if [ ${SSL_BUILD:-0} -gt 0 ]; then
    echo "Clean up generated certificates"
    rm -rf keycloak
fi

echo "\n\nContainers built"

FROM quay.io/keycloak/keycloak:19.0.1

ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_FEATURES=token-exchange
ENV KC_DB=postgres
# Install custom providers
RUN curl -sL https://github.com/aerogear/keycloak-metrics-spi/releases/download/2.5.3/keycloak-metrics-spi-2.5.3.jar -o /opt/keycloak/providers/keycloak-metrics-spi-2.5.3.jar
RUN /opt/keycloak/bin/kc.sh build

#WORKDIR /opt/keycloak
#COPY --chown=keycloak certificates/both-cert.pem /opt/keycloak/conf/cert.pem
#COPY --chown=keycloak certificates/both-key.pem /opt/keycloak/conf/key.pem

ENV KC_DB_URL_HOST=postgres
ENV KC_DB_USERNAME=keycloak
ENV KC_DB_PASSWORD=keycloak
#ENV KC_HOSTNAME=auth.private.dev
#ENV KC_HOSTNAME_PORT=8443
#ENV KC_PROXY=reencrypt
#ENV KC_HTTPS_CERTIFICATE_FILE=/opt/keycloak/conf/cert.pem
#ENV KC_HTTPS_CERTIFICATE_KEY_FILE=/opt/keycloak/conf/key.pem

#RUN ls -la conf

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD [ "start" ]
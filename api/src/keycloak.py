from keycloak import KeycloakOpenID, KeycloakAdmin

from src.settings import settings


keycloak = KeycloakOpenID(
    server_url=settings.KEYCLOAK_URL,
    client_id=settings.KEYCLOAK_CLIENT_ID,
    realm_name=settings.KEYCLOAK_USER_REALM_NAME,
    client_secret_key=settings.KEYCLOAK_CLIENT_SECRET_KEY,
)

keycloakAdmin = KeycloakAdmin(
    server_url=settings.KEYCLOAK_URL,
    username=settings.KEYCLOAK_ADMIN_USERNAME,
    # TODO: replace this with an env variable
    password=settings.KEYCLOAK_ADMIN_PASSWORD,
    realm_name=settings.KEYCLOAK_MASTER_REALM_NAME,
    # TODO: is this going to change ever?
    user_realm_name=settings.KEYCLOAK_USER_REALM_NAME,
    client_id=settings.KEYCLOAK_CLIENT_ID,
    # TODO: replace this with an env variable
    client_secret_key=settings.KEYCLOAK_CLIENT_SECRET_KEY,
    verify=True,
    auto_refresh_token=["get", "post", "put", "delete"],
)

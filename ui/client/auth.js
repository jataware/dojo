import axios from 'axios';
import React, {
  createContext,
  useContext,
  useState
} from 'react';
import { Redirect, Route } from 'react-router-dom';

export const authStatusEndpoint = '/api/dojo/auth/status';
export const authContext = createContext();

export function AuthWrapper({ children }) {
  const user = null;
  const isAuthenticated = false;
  const auth_url = null;
  const keycloak_url = null;
  const defaultState = {
    user,
    isAuthenticated,
    auth_url,
    keycloak_url,
  };
  const [auth, setAuth] = useState(defaultState);
  const [adminRole, setAdminRole] = useState(null);

  // This gets passed through to context children rather than the direct state setter
  // so that we can ensure that the header stays synced with the current adminRole state
  function setDojoAdmin(role) {
    axios.defaults.headers.common['X-Keycloak-Admin-Dojo-Role'] = role;
    setAdminRole(role);
  }

  function getAuth() {
    if (!auth.isAuthenticated) {
      axios.post(authStatusEndpoint, {}).then((userData) => {
        if (userData.data.authenticated) {
          setAuth((prevAuth) => {
            const newAuth = {
              ...prevAuth,
              keycloak_url: userData.data.keycloak_url,
              user: userData.data.user,
              isAuthenticated: userData.data.authenticated,
            };
            // conditionally add admin_roles so it doesn't show up at all if users don't have it
            // admin_roles is a list of all the roles in the keycloak realm
            // not just the ones the user has
            if (userData.data.admin_roles) newAuth.admin_roles = userData.data.admin_roles;
            return newAuth;
          });
        }
      });
    }
    return {
      auth,
      setAuth
    };
  }

  const authValue = (process.env.AUTH_ENABLED ? getAuth() : {});

  console.log('THIS IS AUTHVALUE', authValue)
  return (
    <authContext.Provider value={{ ...authValue, adminRole, setDojoAdmin }}>
      {children}
    </authContext.Provider>
  );
}

export function useAuth() {
  return useContext(authContext);
}

export function ProtectedRoute({ children, ...props }) {

  if (!process.env.AUTH_ENABLED) {
    return <Route {...props} render={
      ({ location }) => {
        return children;
      }}
    />
  }

  const { auth } = useAuth();
  if (auth.isAuthenticated) {
    return (
      <Route
        {...props}
        render={
          ({ location }) => {
            return children;
          }
        }
      />
    );
  } else {
    axios.post(authStatusEndpoint, {}).then((response) => {
        if (!response?.data?.authenticated && response?.data?.auth_url) {
            window.location = response.data.auth_url;
            return <Redirect to={response.data.auth_url}/>
        }
    });
    return <h1>Checking Authentication</h1>
  }
}

export function AuthRedirectHandler({ children }) {
  const { setAuth } = useAuth();
  const params = new URLSearchParams(location.search);
  const payload = { auth_code: params.get('code') };

  axios.post(authStatusEndpoint, payload).then((response) => {
    setAuth((prevAuth) => {
      const newAuth = {
        ...prevAuth,
        keycloak_url: response.data.keycloak_url,
        user: response.data.user,
        isAuthenticated: true,
      };
      if (response.data.admin_roles) newAuth.admin_roles = response.data.admin_roles;
      return newAuth;
    });

    setTimeout(() => { document.location = '/'; }, 30);
  });

  return (
    <div>
      <h1>Handling auth</h1>
    </div>
  );
}

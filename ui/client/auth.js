import axios from 'axios';
import React, { useContext, createContext, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';

export const authStatusEndpoint = '/api/dojo/auth/status';
export const authContext = createContext();

export function AuthWrapper({ children }) {
  const user = null;
  const isAuthenticated = false;
  const auth_url = null;
  const keycloak_url = null;
  const dojo_roles = [];
  const defaultState = {
    user,
    isAuthenticated,
    auth_url,
    keycloak_url,
    dojo_roles,
  };
  const [auth, setAuth] = useState(defaultState);

  function getAuth() {
    if (!auth.isAuthenticated) {
      axios.post(authStatusEndpoint, {}).then((userData) => {
        if (userData.data.authenticated) {
          setAuth({
            ...auth,
            keycloak_url: userData.data.keycloak_url,
            user: userData.data.user,
            isAuthenticated: userData.data.authenticated,
            dojo_roles: userData.data.dojo_roles,
          });
        }
      });
    }
    return {
      auth,
      setAuth
    };
  }


// TODO: remove this true


  const authValue = (process.env.AUTH_ENABLED || true ? getAuth() : {});

  console.log('THIS IS AUTHVALUE', authValue)
  return (
    <authContext.Provider value={authValue}>
      {children}
    </authContext.Provider>
  );
}

export function useAuth() {
  return useContext(authContext);
}

export function ProtectedRoute({ children, ...props }) {


// TODO: turn this back on


  // if (!process.env.AUTH_ENABLED) {
  //   return <Route {...props} render={
  //     ({ location }) => {
  //       return children;
  //     }}
  //   />
  // }

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
  const { auth, setAuth } = useAuth();
  const params = new URLSearchParams(location.search);
  const payload = { auth_code: params.get('code') };

  axios.post(authStatusEndpoint, payload).then((response) => {
    setAuth({
      ...auth,
      user: response.data.user,
      isAuthenticated: true,
      keycloak_url: response.data.keycloak_url,
      dojo_roles: response.data.dojo_roles,
    });
    setTimeout(() => { document.location = '/'; }, 30);
  });

  return (
    <div>
      <h1>Handling auth</h1>
    </div>
  );
}

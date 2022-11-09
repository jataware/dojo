import axios from 'axios';
import React, { useContext, createContext, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';

const authEndpoint = '/api/dojo/auth/status';
export const authContext = createContext();

export function AuthWrapper({ children }) {
  const user = null;
  const isAuthenticated = false;
  const defaultState = {
    user,
    isAuthenticated
  };
  const [auth, setAuth] = useState(defaultState);

  function getAuth() {
    if (!auth.isAuthenticated) {
      axios.post(authEndpoint, {}).then((userData) => {
        if (userData.data.authenticated) {
          setAuth({
            ...auth,
            isAuthenticated: userData.data.authenticated,
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
  return (
    <authContext.Provider value={authValue}>
      {children}
    </authContext.Provider>
  );
}

function useAuth() {
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
    axios.post(authEndpoint, {}).then((response) => {
        if (!response?.data?.authenticated && response?.data?.auth_url) {
            window.location = response.data.auth_url;
            return <Redirect to={response.data.auth_url}/>
        }
    });
    return <h1>Checking Authentication</h1>
  }
}

export function AuthRedirectHandler({ children }) {
  console.log('hitting AuthRedirectHandler')
  const { auth, setAuth } = useAuth();
  const params = new URLSearchParams(location.search);
  const payload = { auth_code: params.get('code') };

  axios.post(authEndpoint, payload).then((response) => {
    const newUser = response.data.user;
    setAuth({
      ...auth,
      user: newUser,
      isAuthenticated: true,
    });
    setTimeout(() => { document.location = '/'; }, 30);
  });

  return (
    <div>
      <h1>Handling auth</h1>
    </div>
  );
}

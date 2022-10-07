
import axios from 'axios';
import React, { useContext, createContext, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Route } from 'react-router-dom';


const authEndpoint = "/api/dojo/auth/status";
export const authContext = createContext();

export function AuthWrapper({ children }) {
  const auth = getAuth();
  return (
    <authContext.Provider value={auth}>
      {children}
    </authContext.Provider>
  )
}

function getAuth() {


  const user = null;
  const isAuthenticated = false;
  const defaultState = {
    user,
    isAuthenticated
  }
  const [auth, setAuth] = useState(defaultState);
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
  }
}

function useAuth() {
  return useContext(authContext);
}


export function ProtectedRoute({ children, ...props }) {

  let { auth, setAuth } = useAuth();

  if (process.env.REQUIRE_AUTH !== "true" || auth.isAuthenticated) {
    return <Route {...props} render={
      ({ location }) => {
        return children;
      }}
    />
  }
  else {
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

    const { auth, setAuth } = useAuth();
    const params = new URLSearchParams(location.search);
    const payload = {auth_code: params.get('code')};
    
    axios.post(authEndpoint, payload).then((response) => {
        const newUser = response.data.user;
        setAuth({
            ...auth,
            user: newUser,
            isAuthenticated: true,
        });
        document.location = "/";
    });

    return <>
        <div>
            <h1>Handling auth</h1>
        </div>
    </>
}
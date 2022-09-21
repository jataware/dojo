
import axios from 'axios';
import React, { useContext, createContext, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Route } from 'react-router-dom';
import { useCookies } from 'react-cookie';


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

  const [cookies, setCookie, removeCookie] = useCookies();

  const user = null;
  const accessToken = cookies['access-token'] || null;
  const refreshToken = cookies['refresh-token'] || null;
  const isAuthenticated = false;
  const defaultState = {
    user,
    accessToken,
    refreshToken,
    isAuthenticated
  }
  const [auth, setAuth] = useState(defaultState);
  console.log(auth);
  // Check if we have an active token or refresh token, assuming we aren't already logged in.
  if ((!auth.isAuthenticated) && (accessToken || refreshToken)) {
    axios.post(authEndpoint, {
      access_token: accessToken,
      refresh_token: refreshToken,
    }).then((userData) => {
      if (userData.data.authenticated) {
        setAuth({
          ...auth,
          isAuthenticated: userData.data.authenticated,
          accessToken: userData.data.access_token,
          refreshToken: userData.data.refresh_token,
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
  console.log(auth);

  if (auth.isAuthenticated) {
    return <Route {...props} render={
      ({ location }) => {
        return children;
      }}
    />
  }
  else {
    axios.post(authEndpoint, {
        access_token: auth.accessToken,
        refresh_token: auth.refreshToken,
    }).then((response) => {
        console.log(response);
        if (!response?.data?.authenticated && response?.data?.auth_url) {
            window.location = response.data.auth_url;
            return <Redirect to={response.data.auth_url}/>
        }
        else {
            console.log("No?");
            console.log(!response?.data?.authenticated && response?.data?.auth_url);
            console.log(response?.data?.authenticated, response?.data?.auth_url);
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
        console.log(response)
        const newAccessToken = response.data.access_token;
        const newRefrestToken = response.data.refresh_token;
        const newUser = response.data.user;
        let obj = {
            user: newUser,
            accessToken: newAccessToken,
            refreshToken: newRefrestToken,
            isAuthenticated: true,
        };
        setAuth({
            user: newUser,
            accessToken: newAccessToken,
            refreshToken: newRefrestToken,
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
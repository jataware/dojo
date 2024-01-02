import React, { createContext, useState } from 'react';

export const ThemeContext = createContext({});

const ThemeContextProvider = ({ children }) => {
  const [showNavBar, setShowNavBar] = useState(true);
  const [showSideBar, setShowSideBar] = useState(true);

  return (
    <ThemeContext.Provider value={{
      showNavBar, setShowNavBar, showSideBar, setShowSideBar,
    }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;

import React, { createContext, useState } from 'react';

export const ThemeContext = createContext({});

const ThemeContextProvider = ({ children }) => {
  const [showNavBar, setShowNavBar] = useState(true);
  const [fixedNavBar, setFixedNavBar] = useState(false);

  return (
    <ThemeContext.Provider value={{ showNavBar, setShowNavBar, fixedNavBar, setFixedNavBar }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;

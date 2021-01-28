import React, { createContext, useEffect, useState, useContext } from 'react';
import firebase from 'firebase/app';

export interface AuthContextInterface {
  user: firebase.User | undefined | null;
}

export const AuthContext = createContext<AuthContextInterface>({
  user: undefined,
});

export const AuthProvider = (props: { children?: React.ReactNode }) => {
  const [user, setUser] = useState<firebase.User | null>();

  useEffect(() => {
    return firebase.auth().onAuthStateChanged(setUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

import { createContext, useContext, useEffect, useState } from "react";
// 🛡️ CRITICAL FIX: googleProvider is imported from your local firebase.js
import { auth, googleProvider } from "../firebase"; 
import { onAuthStateChanged, signOut, signInWithPopup } from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Uses the instances exported from your firebase.js
  const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  useEffect(() => {
    try {
      // Listens for changes in authentication state
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setLoading(false);
      });
      return unsubscribe;
    } catch (err) {
      console.error("Auth initialization error:", err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loginWithGoogle, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};
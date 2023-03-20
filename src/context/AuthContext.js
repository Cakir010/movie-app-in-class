import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../auth/Firebase";
import { toastErrorNotify, toastSuccessNotify , toastWarnNotify } from "../helpers/ToastNotify";

export const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(sessionStorage.getItem('user')) || false
    );
  const navigate = useNavigate();

  useEffect(() => {
    userObserver();
  }, []);

  const createUser = async (email, password , displayName) => {
    try {

      //!yeni bir kullanıcı için kullanılan firebase metodu
      let userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(auth.currentUser, {
        displayName: displayName,
      })
      navigate("/");
      toastSuccessNotify("/Registered successfuly!");
      console.log(userCredential);
    } catch (error) {
      toastErrorNotify("error.message");
    }
  };

  const logOut = () => {
    signOut(auth);
  };

  const signIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
      toastSuccessNotify("  Logged in successfuly!");
    } catch (error) {
      toastErrorNotify("error.message");
    }
  };

  const userObserver = () => {
    //!Kullanıcının signin olup olmadıgını takip eden ve kullanıcı degiştiğinde yeni kullanıcıyı response olarak dönen firebase metodudur.
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const { email, displayName, photoURL } = user;
        setCurrentUser(email, displayName, photoURL);
        sessionStorage.setItem(
          'user',
          JSON.stringify({email,displayName,photoURL})
        )
        
      } else {
        setCurrentUser(false);
        sessionStorage.clear()
        // console.log('logged out')
      }
    });
  };

  //* https://console.firebase.google.com/
  //* => Authentication => sign-in-method => enable Google
  //! Google ile girişi enable yap
  //* => Authentication => settings => Authorized domains => add domain
  //! Projeyi deploy ettikten sonra google sign-in çalışması için domain listesine deploy linkini ekle
  const signUpProvider = () => {
    //? Google ile giriş yapılması için kullanılan firebase metodu
    const provider = new GoogleAuthProvider();
    //? Açılır pencere ile giriş yapılması için kullanılan firebase metodu
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log(result);
        navigate("/");
        toastSuccessNotify("Logged in successfully!");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const forgotPassword = (email) => {
    //? Email yoluyla şifre sıfırlama için kullanılan firebase metodu
    sendPasswordResetEmail(auth, email)
      .then(() => {
        // Password reset email sent!
        toastWarnNotify("Please check your mail box!");
        // alert("Please check your mail box!");
      })
      .catch((err) => {
        toastErrorNotify(err.message);
        // alert(err.message);
        // ..
      });
  };

  const values = {
    createUser,
    signIn,
    signUpProvider, 
    logOut,
    forgotPassword,
    currentUser,
    // currentUser: { displayName: "Emre Çakır" },
  };
  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export default AuthContextProvider;

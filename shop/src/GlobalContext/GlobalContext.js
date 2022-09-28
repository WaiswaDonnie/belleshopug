import React, { useContext, createContext, useState, useLayoutEffect, useEffect } from 'react'
import { collection, deleteDoc, limit, increment, collectionGroup, getDocs, getDoc, doc, setDoc, updateDoc, onSnapshot, serverTimestamp, query, where, addDoc, orderBy } from 'firebase/firestore';
import { db, auth } from '../../firebase'
import { getAuth, sendPasswordResetEmail, sendEmailVerification, signInWithPopup, signInWithEmailAndPassword, GoogleAuthProvider, signOut, RecaptchaVerifier, updateProfile, signInWithPhoneNumber, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router"
import { useModalAction } from '@/components/ui/modal/modal.context';
import { useTranslation } from 'next-i18next';
import Cookies from 'js-cookie'
import { toast } from 'react-toastify';

import {
    QueryClient,
    useMutation,
    useQuery,
    useQueryClient,
} from 'react-query';
// import { toast } from 'react-toastify';
// import client from './client';
import { authorizationAtom } from '@/store/authorization-atom';
import { useAtom } from 'jotai';
import { signOut as socialLoginSignOut } from 'next-auth/react';
import { useToken } from '@/lib/hooks/use-token';
// import { API_ENDPOINTS } from './client/api-endpoints';

import { initialOtpState, optAtom } from '@/components/otp/atom';
import { useStateMachine } from 'little-state-machine';
import {
    initialState,
    updateFormState,
} from '@/components/auth/forgot-password';
import { clearCheckoutAtom } from '@/store/checkout';
export const GlobalContext = createContext()



export default function GlobalContextProvider({ children }) {
    const navigate = useRouter()
    const [user, setUser] = useState(null)
    const { setToken } = useToken();
    const [visible, setVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    const [productId, setProductId] = useState(null)

    useLayoutEffect(() => {
        onAuthStateChanged(auth, authUser => {
            if (authUser) {
                // navigate.push('/makeup')
                setUser(authUser)
            }
        })
    }, [user])





     
    const [orderDetails, setOrderDetails] = useState(null)

    const getOrder = (orderId) => {
        onSnapshot(query(collection(db, 'Orders'), where("orderId", "==", orderId)), snapshot => {
            let data = []
            snapshot.forEach(doc => {

                data.push(doc.data())
            })
            if(data.length>0){
                setOrderDetails(data[0])
                console.log("order",data[0])
            }

        })
    }

    const createOrder = async (newProduct, setLoading) => {
      
        setLoading(true)
        console.log("product", newProduct)
        // newProduct.products.forEach(async product=>{
        //     onSnapshot(query(collectionGroup(db, 'Products'), where("id", "==", product.product_id)), snapshot => {
        //         let data = []
        //         snapshot.forEach(doc => {
        //             data.push(doc.data())
        //         })
        //         console.log("pshop is comeas got is", data[0].shop_id)
        //         setProductDetails(data[0])
               
        //     }) 
        // })
         addDoc(collection(db,'Orders'), newProduct)
            .then(res => {
                updateDoc(doc(db,'Orders', res.id), {
                    orderId: res.id,
                    tracking_number: res.id,
                    customer_id: user.uid,
                    "status": {
                        "id": 1,
                        "name": "Order Received",
                        "language": "en",
                        "translated_languages": [
                            "en"
                        ],
                        "serial": 1,
                        "color": "#23b848",
                        "created_at": "2021-03-08T21:33:52.000000Z",
                        "updated_at": "2021-03-08T21:34:04.000000Z"
                    },
                    customer: {
                        "id": user.uid,
                        "name": user.displayName,
                        "email": user.email,
                        "profile": {
                            "avatar": {
                                "thumbnail": user?.photoURL,
                                "original": user?.photoURL,

                            }
                        }

                    }
                })
                navigate.push(`/orders/${res.id}`)
                setLoading(false)

                setVisible(false)                // handleClose()
            })
            .catch(error => {
                setLoading(false)

                console.log(error)
            })
    }
    const trackProduct = async (trackingId) => {
        console.log("id", trackingId)
        getDoc(doc(db, 'Products', trackingId))
            .then(results => {
                setProductDetails(results.data())
            })
            .catch(error => {
                console.log(error)
            })
    }
    const editProduct = async (newProduct) => {
        setLoading(true)
        updateDoc(doc(db, 'Products', productId), {
            productName: newProduct?.productName,
            customerName: newProduct?.customerName,
            productLocation: newProduct?.productLocation,
            customerEmail: newProduct?.customerEmail,
            productDescription: newProduct?.productDescription,
            status: newProduct?.status,
        })
            .then(res => {
                setProductId(null)
                setLoading(false)
            })
            .catch(error => {
                setLoading(false)

                console.log(error)
            })
    }

    const [productDetails, setProductDetails] = useState(null)
    const getProductDetails = (productId) => {
       
       if(productId){
        onSnapshot(query(collectionGroup(db, 'Products'), where("id", "==", productId)), snapshot => {
            let data = []
            snapshot.forEach(doc => {
                data.push(doc.data())
            })
            console.log("product got is", data)
            setProductDetails(data[0])
           
        })
       }
        // if (productId) {
        //     getDoc(doc(db, 'Products', productId))
        //         .then(res => {
        //             setProductDetails(res.data)
        //         })
        //         .catch(error => {
        //             console.log(error)
        //         })
        // }
    }
    const createUser = async (username, email, password, setLoading, setFormError, closeModal, setAuthorized) => {
        console.log(username, email, password)
        setLoading(true)
        createUserWithEmailAndPassword(auth, email, password)
            .then(async userCredentials => {
                updateProfile(auth.currentUser, {
                    displayName: username
                })
                setUser(userCredentials.user)
                setDoc(doc(db, 'Users', userCredentials.user.uid), {
                    displayName: username,
                    userId: userCredentials.user.uid,
                    joinedOn: serverTimestamp(),
                    email: email,
                })
                    .then(async result => {
                        setLoading(false)
                        setUser(userCredentials.user)
                        userCredentials.user.getIdToken()
                            .then(token => {
                                updateDoc(doc(db, 'Users', userCredentials.user.uid), {
                                    token: token
                                })

                                Cookies.set('auth_token', token)
                                setToken(token);
                                closeModal();
                                setAuthorized(true)
                            })
                            .catch(error => { })

                        // navigate.push('/makeup')




                    })
                    .catch(error => {
                        setLoading(false)
                        console.log("setting doc", error)
                        setFormError(error.code)
                        toast.error((error.code));
                    })
            }).catch(error => {
                setLoading(false)
                console.log(error.code)
                setFormError(error.code)
                toast.error((error.code));
            })
    }
    const loginUser = async (email, password, setLoading, setFormError, closeModal, setAuthorized) => {
        console.log(email, password)
        setLoading(true)
        signInWithEmailAndPassword(auth, email, password)
            .then(async userCredentials => {

                setUser(userCredentials.user)
                userCredentials.user.getIdToken()
                    .then(token => {
                        updateDoc(doc(db, 'Users', userCredentials.user.uid), {
                            token: token
                        })
                        Cookies.set('auth_token', token)
                        setToken(token);
                        setLoading(false)
                        closeModal();
                        setAuthorized(true)
                    })
                    .catch(error => {
                        toast.error((error.code));
                    })






            }).catch(error => {
                setLoading(false)
                console.log(error.code)
                setFormError(error.code)
                toast.error((error.code));
            })
    }

    const { t } = useTranslation('common');
    // const [_, setAuthorized] = useAtom(authorizationAtom);
    // const { closeModal } = useModalAction();

    const loginWithGoogle = async (closeModal, setAuthorized) => {


        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                //   const credential = GoogleAuthProvider.credentialFromResult(result);
                //   const token = credential.accessToken;
                // The signed-in user info.
                setUser(result.user)
                Cookies.set('auth_token', result.user.accessToken)
                console.log("Google Data", result.user)
                // navigate.push('/makeup')
                setToken(result.user.accessToken);
                setAuthorized(true);
                closeModal();
                // document.cookie = "auth_token=admin";

                // localStorage.setItem('@user', JSON.stringify(user))
                // ...
            }).catch((error) => {
                // Handle Errors here.
                // const errorCode = error.code;
                // const errorMessage = error.code;
                // The email of the user's account used.
                // const email = error.email;
                // The AuthCredential type that was used.
                // const credential = GoogleAuthProvider.credentialFromError(error);
                // ...
            });
    }

    const [clientProducts, setClientProducts] = useState([])

    useEffect(() => {
        getProducts()
    }, [])

    const getProducts = () => {
        onSnapshot(collectionGroup(db, 'Products'), snapshot => {
            let data = []
            snapshot.forEach(doc => {
                data.push(doc.data())
            })
            console.log("products", data)
            setClientProducts(data)
        })
    }

    const [clientProduct, setClientProduct] = useState(null)
    const getProduct = (slug) => {
        onSnapshot(query(collectionGroup(db, 'Products'), where("slug", "==", slug)), snapshot => {
            let data = []
            snapshot.forEach(doc => {
                data.push(doc.data())
            })
            console.log("product", data)
            setClientProduct(data)
        })
    }



    return (
        <GlobalContext.Provider
            value={{
                user,
                 
                loginWithGoogle,
                setClientProduct,
                getProduct,
                clientProducts,
                getProducts,
                visible,
                loading, setLoading,
                createUser,
                loading,
                setVisible,
                orderDetails,
                getOrder,
                editProduct,
                productId,
                createOrder,
                setProductId,
                productDetails,
                setProductDetails,
                getProductDetails,
                trackProduct, loginUser,
                productDetails,
            }} >
            {children}
        </GlobalContext.Provider>
    )
}
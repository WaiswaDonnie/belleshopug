import React, { useContext, createContext, useState, useLayoutEffect } from 'react'
import { collection, deleteDoc, limit, increment, collectionGroup, getDocs, getDoc, doc, setDoc, updateDoc, onSnapshot, serverTimestamp, query, where, addDoc, orderBy } from 'firebase/firestore';
import { db, auth } from '../../firebase'
import { getAuth, sendPasswordResetEmail, sendEmailVerification, signInWithPopup, signInWithEmailAndPassword, GoogleAuthProvider, signOut, RecaptchaVerifier, updateProfile, signInWithPhoneNumber, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router"
import { useModalAction } from '@/components/ui/modal/modal.context';
import { useTranslation } from 'next-i18next';
import Cookies from 'js-cookie'
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





    const addProduct = async (newProduct) => {
        const date = new Date()
        const fullDate = date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate()
        setLoading(true)
        addDoc(collection(db, 'Vendors', newProduct.vendorId, 'Shops', newProduct.shopId, 'Products'), {
            productName: newProduct.productName,
            customerName: newProduct.customerName,
            productLocation: newProduct.productLocation,
            customerEmail: newProduct.customerEmail,
            productDescription: newProduct.productDescription,
            status: newProduct.status,
            date: fullDate,
            productQuantity: newProduct.productQuantity
        })
            .then(res => {
                updateDoc(doc(db, 'Vendors', newProduct.vendorId, 'Shops', newProduct.shopId, 'Products', res.id), {
                    productId: res.id,
                })
                setLoading(false)

                setVisible(false)                // handleClose()
            })
            .catch(error => {
                setLoading(false)

                console.log(error)
            })
    }

    const createOrder = async (newProduct, setLoading) => {
        const date = new Date()
        const fullDate = date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate()
        setLoading(true)
        console.log("product", newProduct)
        const newOrder =
        {
            "id": 66,
            "tracking_number": "CGG82oQZc4i8",
            "customer_id": user.uid,
            "customer_contact": "19365141641631",
            "language": "en",
            "status": {
                "id": 1,
                "name": "Order Received",
                "serial": 1,
                "color": "#23b848",
                "created_at": "2021-03-08T21:33:52.000000Z",
                "updated_at": "2021-03-08T21:34:04.000000Z",
                "language": "en",
                "translated_languages": [
                    "en"
                ]
            },
            "amount": 150,
            "sales_tax": 3,
            "paid_total": 153,
            "total": 153,
            "coupon_id": null,
            "parent_id": null,
            "shop_id": 78,
            "discount": 0,
            "payment_id": null,
            "payment_gateway": "CASH_ON_DELIVERY",
            "shipping_address": {
                "zip": "40391",
                "city": "Winchester",
                "state": "KY",
                "country": "United States",
                "street_address": "2148  Straford Park"
            },
            "billing_address": {
                "zip": "122",
                "city": "aaa",
                "state": "aaaa",
                "country": "aaa",
                "street_address": "ss"
            },
            "logistics_provider": null,
            "delivery_fee": 0,
            "delivery_time": "Express Delivery",
            "deleted_at": null,
            "created_at": "2022-01-12T07:29:20.000Z",
            "updated_at": "2022-01-12T07:29:20.000Z",
            "customer": {
                "id": user.uid,
                "name": user.displayName,
                "email": user.email,
                "email_verified_at": null,
                "created_at": serverTimestamp(),
                "updated_at": serverTimestamp(),
                "is_active": 1,
                "shop_id": null
            },
            "products": [],
            "refund": null
        }
        addDoc(collection(db, 'Vendors', newProduct.vendor_id, 'Shops', newProduct.shop_id, 'Orders'), newProduct)
            .then(res => {
                updateDoc(doc(db, 'Vendors', newProduct.vendor_id, 'Shops', newProduct.shop_id, 'Orders', res.id), {
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
    const getProductDetails = () => {

        if (productId) {
            getDoc(doc(db, 'Products', productId))
                .then(res => {
                    setProductDetails(res.data)
                })
                .catch(error => {
                    console.log(error)
                })
        }
    }

    const { t } = useTranslation('common');
    // const [_, setAuthorized] = useAtom(authorizationAtom);
    // const { closeModal } = useModalAction();
    const { setToken } = useToken();
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

    const [products, setProducts] = useState([])


    const getProducts = () => {
        onSnapshot(collection(db, 'Products'), snapshot => {
            let data = []
            snapshot.forEach(doc => {
                data.push(doc.data())
            })
            setProducts(data)
        })
    }




    return (
        <GlobalContext.Provider
            value={{
                user,
                addProduct,
                loginWithGoogle,
                products,
                getProducts,
                visible,
                loading,
                setVisible,
                editProduct,
                productId,
                createOrder,
                setProductId,
                productDetails,
                setProductDetails,
                getProductDetails,
                trackProduct
            }} >
            {children}
        </GlobalContext.Provider>
    )
}
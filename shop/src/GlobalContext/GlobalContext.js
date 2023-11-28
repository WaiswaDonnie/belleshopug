import React, { useContext, createContext, useState, useLayoutEffect, useEffect } from 'react'
import { collection, deleteDoc, limit, increment, collectionGroup, getDocs, getDoc, doc, setDoc, updateDoc, onSnapshot, serverTimestamp, query, where, addDoc, orderBy, arrayUnion, Timestamp, Firestore } from 'firebase/firestore';
import { db, auth, storage, firebaseFunctions } from '../../firebase'
import { getAuth, sendPasswordResetEmail, updateEmail, sendEmailVerification, signInWithPopup, signInWithEmailAndPassword, GoogleAuthProvider, signOut, RecaptchaVerifier, updateProfile, signInWithPhoneNumber, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router"
import { useModalAction } from '@/components/ui/modal/modal.context';
import { useTranslation } from 'next-i18next';
import Cookies from 'js-cookie'
 import { toast } from 'react-toastify';
import axios from 'axios';
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
import { useToken } from '@/lib/hooks/use-token';
// import { API_ENDPOINTS } from './client/api-endpoints';

import { initialOtpState, optAtom } from '@/components/otp/atom';
import { useStateMachine } from 'little-state-machine';
import {
    initialState,
    updateFormState,
} from '@/components/auth/forgot-password';
import { clearCheckoutAtom } from '@/store/checkout';
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
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
        onSnapshot(query(collection(db, 'Product Orders'), where("orderId", "==", orderId)), snapshot => {
            let data = []
            snapshot.forEach(doc => {

                data.push(doc.data())
            })
            if (data.length > 0) {
                setOrderDetails(data[0])
                console.log("order", data[0])
            }

        })
    }



    const [myOrders, setMyOrders] = useState([])

    const getMyOrders = async (setIsLoading) => {

        if (user) {
            // setIsLoading(true)
            onSnapshot(query(collection(db, 'Product Orders'), where('userId', "==", user.uid), orderBy("ordered_on", 'desc')), snapshot => {
                let data = []
                snapshot.forEach(doc => {
                    data.push(doc.data())
                })
                console.log("my orders are", data)
                setMyOrders(data)

            })
            // setIsLoading(false)

        }
    }
    let y = new Date()
    let years = y.getFullYear()
    let month = Number(y.getMonth() + 2)
    let day = y.getDate()

    if (Number(day) < 10) {
        day = "0" + day;
    }
    if (Number(month) < 10) {
        month = "0" + month;
    }
    var full_date = years + "-" + String(month) + "-" + day;

    const [shopInfo, setShopInfo] = useState({})
    const getShopInfo = async (id, setLoading) => {
        // setLoading(true)

        if (id) {
            onSnapshot(query(collectionGroup(db, 'Shops'), where("id", "==", id)), snapshot => {
                let data = [];
                snapshot.forEach(doc => {
                    data.push(doc.data())
                })
                setShopInfo(data[0])

            })
        }
        // setLoading(false)
    }
    const [shopProducts, setShopProducts] = useState([])
    const getShopProducts = async (id, setLoading) => {
        setLoading(true)
        onSnapshot(query(collectionGroup(db, 'Products'), where("shop_id", "==", id)), snapshot => {
            let data = [];
            snapshot.forEach(doc => {
                data.push(doc.data())
            })
            setShopProducts(data)

        })
        setLoading(false)
    }
    const [shops, setShops] = useState([])
    const getShops = async (setIsLoading) => {
        setIsLoading(true)

        onSnapshot(collectionGroup(db, 'Shops'), snap => {
            let data = [];
            snap.forEach(doc => {
                data.push(doc.data())
            })
            setShops(data)
        })
    }
    function formatString(inputString) {
        const parts = inputString.split(/\d+/);
        if (parts.length === 2) {
            const firstPart = parts[0].toUpperCase();
            const secondPart = parts[1].toUpperCase();
            return `${firstPart}-${secondPart}`;
        }
        return inputString;
    }
    
    
    is_digital
    :
    undefined
   
     
   
   
    
    unit
    :
    undefined
    const createOrder = async (newProduct, setLoading) => {
    
        if (userInfo) {
            delete newProduct.billing_address.zip;
            newProduct?.products.map((res) => {
                delete res?.slug;
                delete res?.stock;
                delete res?.unit;
                delete res?.language;
            })
            console.log("new product", newProduct)
            setLoading(true)
            addDoc(collection(db, 'Product Orders'), {
                createdAt: serverTimestamp(),
                cartItems: newProduct?.products?.length,
                deliveryFee: newProduct?.delivery_fee,
                platform: "web",
                discount: 0,
                discountPrice: newProduct?.discount,
                imageUrl: "default",
                paymentMethod: "cash",
                status: "Pending",
                totalFee: newProduct?.total,
                subTotal: newProduct?.total,
                type: "active",
                userName: userInfo.userName,
                userId: userInfo.userId,
                products: newProduct?.products,
                billing_address: newProduct?.billing_address,
                shipping_address: newProduct?.billing_address,
                address: newProduct?.billing_address,
                phoneNumber: userInfo.phoneNumber,
            })
                .then(async res => {
                    updateDoc(doc(db, 'Product Orders', res.id), {
                        orderCode: formatString(res.id),
                        orderId: res.id,
                    }).then((order) => {

                        newProduct?.products.map((product) => {
                            if (product?.type?.toLowerCase() === "influenced") {
                                console.log("influencer", product)
                                addDoc(collection(db, 'Product Orders', res.id, 'Purchase Cart'),
                                    {
                                        count: product.quantity,
                                        id: product.id,
                                        imageUrl: product.image,
                                        influencerDiscount: product.influencerDiscount ? product?.influencerDiscount : 0,
                                        influencerId: product.influencerId ? product?.influencerId : "",
                                        influencerImageUrl: product.influencerImageUrl ? product?.influencerImageUrl : "",
                                        influencerName: product.influencerName ? product?.influencerName : "",
                                        owner: "",
                                        price: product.price,
                                        timestamp: serverTimestamp(),
                                        total: product.itemTotal,
                                        type: product?.type,
                                        title: product?.name,
                                        status: product?.status,
                                        discountedPrice: product?.discountedPrice
                                    })
                            } else if (product?.type?.toLowerCase() === "combo") {
                                console.log("combo", product)

                                addDoc(collection(db, 'Product Orders', res.id, 'Purchase Cart'),
                                    {
                                        count: product.quantity,
                                        id: product.id,
                                        imageUrl: product.image,
                                        owner: "",
                                        price: product.price,
                                        timestamp: serverTimestamp(),
                                        total: product.itemTotal,
                                        type: product?.type,
                                        title: product?.name,
                                        status: product?.status,
                                        discountedPrice: product?.discountedPrice
                                    })
                            } else {
                                console.log("others", product)

                                addDoc(collection(db, 'Product Orders', res.id, 'Purchase Cart'),
                                    {
                                        count: product.quantity,
                                        id: product.id,
                                        imageUrl: product.image,
                                        owner: "",
                                        price: product.price,
                                        timestamp: serverTimestamp(),
                                        total: product.itemTotal,

                                        title: product?.name,
                                        status: product.status ? product.status : "",
                                        discountedPrice: product.discountedPrice ? product.discountedPrice : 0,
                                        brand: product.brand ? product.brand : "",
                                        categoryList: product?.categoryList,
                                        shopId: product.shopId ? product.shopId : ""

                                    })
                            }
                        }),

                            navigate.push(`orders/${res.id}`)
                    })
                        .catch((err) => {
                            console.log(err)
                            setLoading(false)
                            setVisible(false)
                        })

                })
                .catch(error => {
                    setLoading(false)

                    console.log(error)
                })
        }
    }
    const createOrderMoney = async (newProduct, setLoading) => {
        if (userInfo) {
            setLoading(true)
            addDoc(collection(db, 'Product Orders'), newProduct)
                .then(async res => {
                    updateDoc(doc(db, 'Product Orders', res.id), {
                        orderId: res.id,
                        tracking_number: res.id,
                        platform: "web",
                        customer_id: user.uid,
                        ordered_on: serverTimestamp(),
                        created_at: full_date,
                        orderCode: formatString(res.id),
                        transactionStatus: "pending",
                        "status": {
                            "id": 1,
                            "name": "Order Received",
                            "language": "en",
                            "translated_languages": [
                                "en"
                            ],
                            "serial": 1,
                            "color": "#23b848",
                            "created_at": full_date,
                            "updated_at": full_date
                        },
                        customer: {
                            "id": user.uid,
                            "name": userInfo.userName,
                            "email": userInfo.email,
                            "profile": {
                                "avatar": {
                                    "thumbnail": user?.photoURL,
                                    "original": user?.photoURL,
                                }
                            }
                        },
                        userName: userInfo.userName,
                        userId: userInfo.userId,
                        paymentMethod: "CASH ON DELIVERY",
                        "amount": newProduct?.amount,
                        "billing_address": newProduct?.billing_address,
                        "customer_contact": newProduct?.customer_contact,
                        "delivery_fee": newProduct?.delivery_fee,
                        "delivery_time": newProduct?.delivery_time,
                        "discount": newProduct?.discount,
                        "paid_total": newProduct?.paid_total,
                        "delivery_fee": 5000,
                        "payment_gateway": "CASH ON DELIVERY",
                        "products": newProduct?.products,
                        "sales_tax": newProduct?.sales_tax,
                        "shipping_address": newProduct?.shipping_address,
                        "total": newProduct?.total,
                        "use_wallet_points": newProduct?.use_wallet_points,
                    }).then((order) => {
                        console.log(userInfo)
                        let data = {
                            userId: user.uid,
                            // phoneNumber: newProduct?.customer_contact,
                            phoneNumber: '256759723980',
                            amount: newProduct?.amount,
                            orderId: res.id,
                            narration: `Payment for order ${res.id}`,
                        }
                        // makePayment(data, setLoading, setVisible)
                        navigate.push(`orders/${res.id}`)
                    })
                        .catch((err) => {
                            alert(err)
                            setLoading(false)
                            setVisible(false)
                        })

                })
                .catch(error => {
                    setLoading(false)

                    console.log(error)
                })
        }
    }

    const [transactionMessage, setTransactionMessage] = useState("")
    const [loadingTransaction, setLoadingTransaction] = useState("")
    const makePayment = async (payeeDetails, setLoading, setVisible) => {
        if (user !== null) {
            console.log(payeeDetails)
            // setLoadingTransaction(!loadingTransaction)
            setTransactionMessage(`Instatiating payment to ${payeeDetails.phoneNumber}`)
            const mobileMoney = httpsCallable(firebaseFunctions, 'payProductsWithMM')


            mobileMoney(payeeDetails)
                .then(result => {
                    console.log(result)
                    setTransactionMessage('Initiated Payment')
                    const collectionRef = collection(db, 'Product Orders', payeeDetails.orderId, 'Payment')
                    addDoc(collectionRef, result.data)
                        .then(docRef => {

                            checkTransactionStatus({ paymentId: docRef.id, orderId: payeeDetails.orderId }, setLoading, setVisible)
                        }).catch(error => toast.error(error.message))
                    // const collectionRef = collection(db, 'Product Orders')

                    // addDoc(collectionRef, result.data)
                    //     .then(docRef => {
                    //         updateDoc(doc(db, 'Product Orders', docRef.id), {
                    //             orderId: ,
                    //             totalFee: payeeDetails.amount
                    //         })

                    //         // checkTransactionStatus({ paymentId: docRef.id, appointmentId: payeeDetails.appointmentId, providerId: payeeDetails.providerId, providerName: payeeDetails.name })
                    //     }).catch(error => toast.error(error.message))

                }).catch(error => {
                    console.log(error)
                    toast.error('Something went wrong,Please try again later.')
                    setLoadingTransaction(false)
                    setTransactionMessage(null)
                    setLoading(false)
                })


        } else {
            toast("You need to login")
            router.push('/login')
        }

    }

    const [transactionDetails, setTransactionDetails] = useState(null)
    const checkTransactionStatus = async (data, setLoading, setVisible) => {

        const docRef = doc(db, 'Product Orders', data.orderId, 'Payment', data.paymentId)
        const snapshot = await getDoc(docRef)
        const transactionRef = String(snapshot.data().transactionReference)
        // console.log(transactionRef)

        var statusHolder
        const interval = setInterval(() => {
            axios.post(`https://us-central1-belle-beauty-ug.cloudfunctions.net/transactionInfo?transactionReference=${transactionRef}`, {
            })
                .then(res => {
                    // console.log(res.data.data)

                    if (res.data.data.transactionStatus === 'SUCCEEDD') {
                        toast.success('Payment has been picked successfully')
                        // clearInterval(interval)
                        setTransactionMessage(res.data.data.transactionStatus)
                    } else if (res.data.data.transactionStatus === 'FAILED') {
                        toast.error('Payment was unsuccessfull')
                        setTransactionMessage(res.data.data.transactionStatus)
                    } else if (res.data.data.transactionStatus === 'PENDING') {
                        statusHolder = res.data.data
                        // toast.warn('Please enter your PIN')
                        setTransactionDetails(res.data.data)
                        setTransactionMessage(res.data.data.transactionStatus)
                    }

                    statusHolder = res.data.data
                    setTransactionDetails(res.data.data)

                }).catch(error => alert(error.message))
        }, 3000)


        setTimeout(() => {

            const collectionRef = collection(db, 'Product Orders', data.orderId, 'Transaction')

            addDoc(collectionRef, statusHolder)
                .then(() => {

                    if (statusHolder.transactionStatus == "SUCCEEDED") {
                        toast.success(`Payment has been picked successfully`)
                        clearInterval(interval)
                    } else {
                        toast.success("We confirming your order")
                        clearInterval(interval)
                    }
                    updateDoc(doc(db, 'Product Orders', data.orderId), {
                        transactionStatus: statusHolder.transactionStatus,
                        transactionReference: transactionRef
                    })
                    navigate.push(`orders/${data.orderId}`)

                    setTransactionMessage(statusHolder.transactionStatus)
                    setLoading(false)
                    setVisible(false)
                    setTransactionMessage("")


                })

        }, 30000)
    }

    const clearCart = () => {
        setCartItems([])
        setTotalAmounts(0)
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
    const getProductDetails = async (productId) => {

        if (productId) {
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
                    name: username,
                    id: userCredentials.user.uid,
                    created_at: serverTimestamp(),
                    email: email,
                    profile: {
                        avatar: null,
                        bio: null,
                        contact: null,

                    }
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





    const [userInfo, setUserInfo] = useState({})

    useEffect(() => {
        if (user) {
            getUserInfo()
        }
    }, [user])

    const getUserInfo = async () => {
        if (user) {
            getDoc(doc(db, 'Users', user.uid))
                .then(res => {
                    console.log("user info", res.data())
                    setUserInfo(res.data())
                })
                .catch(error => {
                    console.log("user Info")
                })
        }
    }

    const updateUser = (newUser, setLoading) => {
        setLoading(true)
        console.log("newUser", newUser.input)
        updateDoc(doc(db, 'Users', user.uid), newUser.input)
            .then(res => {

                setLoading(false)
                toast.success("Saved Sucessfully")
                getUserInfo()

            })
            .catch(error => {

            })

    }


    const updateUserEmailAndName = (data, setLoading, onClose) => {
        setLoading(true)
        updateDoc(doc(db, 'Users', user.uid), {
            email: data?.email,
            userName: data?.name,
            name: data?.name
        })
            .then(() => {
                updateProfile(auth.currentUser, {
                    displayName: data?.name,
                }).then(() => {
                    // Profile updated!
                    // ...
                }).catch((error) => {
                    // An error occurred
                    // ...
                });
                updateEmail(auth.currentUser, data?.email).then(() => {
                    // Email updated!
                    // ...
                }).catch((error) => {
                    // An error occurred
                    // ...
                });
                setLoading(false)
                onClose()
                getUserInfo()
            })
            .catch(err => {
                console.log(err)
                setLoading(false)
            })
    }

    const updateUserProfile = (newUser, setLoading) => {
        if (user) {
            setLoading(true)
            console.log("profile", newUser)
            newUser['id'] = user.uid
            newUser['profile.avatar'] = newUser.profile.avatar ? newUser.profile.avatar : null
            updateDoc(doc(db, 'Users', user.uid), newUser)
                .then(res => {
                    updateProfile(auth.currentUser, {
                        photoURL: newUser.profile.avatar.original ? newUser.profile.avatar.original : null
                    }).then(() => {
                        // Profile updated!
                        // ...
                    }).catch((error) => {
                        // An error occurred
                        // ...
                    });
                    setLoading(false)
                    toast.success("Saved Sucessfully")
                    getUserInfo()

                })
                .catch(error => {

                })
        }

    }
    const updateUserContact = (contact, setLoading, setOpen) => {
        setLoading(true)
        console.log("phone", contact)
        updateDoc(doc(db, 'Users', user.uid), {
            "profile.contact": contact,
            phoneNumber: contact
        })
            .then(res => {

                setLoading(false)
                toast.success("Saved Sucessfully")
                setOpen(false)
                getUserInfo()


            })
            .catch(error => {
                setLoading(false)
            })

    }
    const updateUserAddress = (address, setLoading, closeModal) => {
        if (userInfo) {
            setLoading(true)
            console.log("address", userInfo)
            updateDoc(doc(db, 'Users', userInfo?.userId), {
                "address": [address]
            })
                .then(res => {

                    setLoading(false)
                    toast.success("Saved Sucessfully")
                    getUserInfo()
                    closeModal()

                })
                .catch(error => {
                    setLoading()
                })
        }

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
    const [combos, setCombos] = useState([])
    const [influencerCombos, setInfluencerCombos] = useState([])
    const [productCategories, setProductCategories] = useState([])
    const [todayDeals, setTodayDeals] = useState([])

    useEffect(() => {
        getProducts()
        getCombos()
        getInfluencerProducts()
        getInfluencersLists()
        getProductCategories()
        getTodayDeals()
    }, [])

    const getTodayDeals = () => {
        onSnapshot(collectionGroup(db, 'Daily Deals'), snapshot => {
            let data = []
            snapshot.forEach(doc => {
                data.push(doc.data())
            })
            console.log("products deals", data)
            setTodayDeals(data)
        })
    }
    const getProductCategories = () => {
        onSnapshot(collectionGroup(db, 'Product Categories'), snapshot => {
            let data = []
            snapshot.forEach(doc => {
                data.push(doc.data())
            })
            console.log("products categories", data)
            setProductCategories(data)
        })
    }
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

    const getProductsByname = (productName, setResponse) => {
        onSnapshot(query(collectionGroup(db, 'Products'), where("categoryList", 'array-contains', productName)), snapshot => {
            let data = []
            snapshot.forEach(doc => {
                data.push(doc.data())
            })
            console.log("products carefo", data)
            setResponse(data)
        })
    }

    const getInfluencersLists = () => {
        onSnapshot(collectionGroup(db, 'Influencers'), snapshot => {
            let data = []
            snapshot.forEach(doc => {
                data.push(doc.data())
            })
            console.log("products", data)
            setInfluencerCombos(data)
        })
    }

    const [influencerProducts, setInfluencerProducts] = useState([])
    const getInfluencerProducts = () => {

        onSnapshot(collectionGroup(db, 'Combos'), snapshot => {
            let data = []
            snapshot.forEach(doc => {
                data.push(doc.data())
            })
            console.log("products", data)
            setInfluencerProducts(data)
        })
    }


    const getCombos = () => {
        onSnapshot(collectionGroup(db, 'Combos'), snapshot => {
            let data = []
            snapshot.forEach(doc => {
                data.push(doc.data())
            })
            console.log("combos", data)
            setCombos(data)
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



    const uploadFiles = async (files, setLoading, setFiles, multiple) => {
        setLoading(true)
        console.log("files ares", files)
        if (multiple) {
            const promises = [];
            for (var i = 0; i < files.length; i++) {
                // files.values contains all the files objects
                const file = files[i];
                const metadata = {
                    contentType: "image/jpeg",
                };
                const storageRef = ref(storage, `users/${user.uid}/attachments/${file.name}`);

                promises.push(uploadBytes(storageRef, file, metadata).then(uploadResult => { return getDownloadURL(uploadResult.ref) }))

            }
            const photos = await Promise.all(promises);
            if (photos) {
                let nowFiles = []
                photos.map((photo, index) => {
                    nowFiles.push({
                        id: index,
                        thumbnail: photo,
                        original: photo
                    })
                })
                setLoading(false)
                setFiles(nowFiles)
                console.log("Photos", nowFiles)
            }


        }
        else {

            const storageRef = ref(storage, `users/${user.uid}/attachments/${files[0].name}`);
            console.log("file to be uploaded", files)

            const uploadTask = uploadBytesResumable(storageRef, files[0]);

            // Register three observers:
            // 1. 'state_changed' observer, called any time the state changes
            // 2. Error observer, called on failure
            // 3. Completion observer, called on successful completion
            uploadTask.on('state_changed',
                (snapshot) => {
                    // Observe state change events such as progress, pause, and resume
                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                    switch (snapshot.state) {
                        case 'paused':
                            console.log('Upload is paused');
                            break;
                        case 'running':
                            console.log('Upload is running');
                            break;
                    }
                },
                (error) => {
                    // Handle unsuccessful uploads

                },
                () => {
                    // Handle successful uploads on complete
                    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        console.log('single file File available at', downloadURL);
                        setLoading(false)
                        // customFiles.push({
                        //     thumbnail: downloadURL,
                        //     original: downloadURL,
                        //     id: downloadURL
                        // })
                        setFiles([{
                            thumbnail: downloadURL,
                            original: downloadURL,
                            id: downloadURL
                        }])
                        console.log('single file File available at', files);




                    });
                }
            )

        }


    }

    const [confirmationResult, setConfirmationResult] = useState(null)
    const [contact, setContact] = useState("")
    const signupWithPhoneNumber = async (contact, setOtpState, setLoading, otpState) => {
        console.log(contact)
        setContact(contact.phone_number)
        setLoading(true)
        let recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {}, auth);
        var currentDate = new Date(); // for now
        const hours = currentDate.getHours();
        const minutes = currentDate.getMinutes();
        const seconds = currentDate.getSeconds();
        const timeString = hours + ":" + minutes
        const DayOfMonth = currentDate.getDate();
        const Month = currentDate.getMonth();
        const Year = currentDate.getFullYear();
        const dateString = (Month + 1) + "/" + DayOfMonth + "/" + Year;
        const now = dateString + " " + timeString


        await signInWithPhoneNumber(auth, contact?.phone_number, recaptchaVerifier)
            // await signInWithPhoneNumber(auth, contact?.phone_number, recaptchaVerifier)
            .then(confirmationResult => {

                setLoading(false)
                window.confirmationResult = confirmationResult;
                setConfirmationResult(confirmationResult)
                // alert(JSON.stringify(confirmationResult))
                setOtpState({ ...otpState, step: "OtpForm" })

            }).catch(error => {
                console.log("phone", error)
                setLoading(false)
            });

    }


    const verifyCode = (code, setOtpState, setIsLoading, closeModal, initialOtpState, setAuthorized) => {
        setIsLoading(true)
        confirmationResult.confirm(code).then(async (result) => {
            // User signed in successfully.
            const user = result.user;
            console.log("newly authenticated user is", result.user)

            // ...
            // setToken(data.token!);
            const userInfo = await getDoc(doc(db, 'Users', result.user.uid))
            if (userInfo.exists()) {
                if (userInfo.data().accountType === 'Customer' || !userInfo.data().accountType) {

                    updateDoc(doc(db, 'Users', userInfo.id), {
                        accountType: 'Customer'
                    })
                    setAuthorized(true);
                    setOtpState({
                        ...initialOtpState,
                    });
                    closeModal();
                    setIsLoading(false)
                    updateDoc(doc(db, 'Users', result.user.uid), {
                        token: user.accessToken
                    })
                    Cookies.set('auth_token', result.user.accessToken)
                    setToken(result.user.accessToken);
                }
                if (userInfo.data().accountType === 'Vendor') {
                    // alert('Account already exists as a Vendor')
                    toast.error("Account already exists as a Vendor")
                    setIsLoading(false)
                    setOtpState({
                        ...initialOtpState,
                    });
                    setLoading(false)
                    signOut(auth)
                        .then(() => {
                            setUser(null)

                        })
                        .catch(error => {

                        })
                }

            } else {
                setDoc(doc(db, 'Users', userInfo.id), {
                    accountType: 'Customer',
                    userId: userInfo.id,
                    phoneNumber: contact,
                    id: userInfo.id,
                    created_at: serverTimestamp(),
                    profile: {
                        avatar: null,
                        bio: null,
                        contact: contact,
                    }
                })
                    .then(() => {
                        Cookies.set('auth_token', result.user.accessToken)
                        setToken(result.user.accessToken);
                        setLoading(false)
                        closeModal();
                        setAuthorized(true)
                        setOtpState({
                            ...initialOtpState,
                        });

                        setIsLoading(false)
                        updateDoc(doc(db, 'Users', result.user.uid), {
                            token: user.accessToken
                        })
                    })
                    .catch((error) => {
                        alert(error.message)
                    })
                // setAuthorized(true);
                // setOtpState({
                //     ...initialOtpState,
                // });
                // closeModal();
                // setIsLoading(false)
                // updateDoc(doc(db, 'Users', result.user.uid), {
                //     token: user.accessToken
                // })
                // Cookies.set('auth_token', result.user.accessToken)
                // setToken(result.user.accessToken);

            }

            // setLoading(false)
            // closeModal();
            // setAuthorized(true)
        }).catch((error) => {
            setIsLoading(false)
            alert(error.message)
            // User couldn't sign in (bad verification code?)
            // ...
        });
    }

    return (
        <GlobalContext.Provider
            value={{
                user,
                signupWithPhoneNumber,
                verifyCode,
                transactionMessage,
                userInfo,
                getUserInfo,
                uploadFiles,
                updateUser,
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
                shopInfo,
                getShopInfo,
                shops,
                getShops,
                setShopInfo,
                shopProducts,
                getShopProducts,
                myOrders,
                getMyOrders,
                combos,
                productId,
                influencerCombos,
                updateUserProfile,
                updateUserContact,
                updateUserAddress,
                createOrder,
                setProductId,
                productDetails,
                setProductDetails,
                influencerProducts,
                updateUserEmailAndName,
                getProductDetails,
                productCategories,
                getProductsByname,
                todayDeals,
                trackProduct, loginUser,
                productDetails,
            }} >
            {children}
        </GlobalContext.Provider>
    )
}
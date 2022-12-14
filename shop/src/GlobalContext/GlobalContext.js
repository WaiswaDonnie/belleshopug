import React, { useContext, createContext, useState, useLayoutEffect, useEffect } from 'react'
import { collection, deleteDoc, limit, increment, collectionGroup, getDocs, getDoc, doc, setDoc, updateDoc, onSnapshot, serverTimestamp, query, where, addDoc, orderBy, arrayUnion } from 'firebase/firestore';
import { db, auth, storage } from '../../firebase'
import { getAuth, sendPasswordResetEmail,updateEmail, sendEmailVerification, signInWithPopup, signInWithEmailAndPassword, GoogleAuthProvider, signOut, RecaptchaVerifier, updateProfile, signInWithPhoneNumber, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
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
            onSnapshot(query(collection(db, 'Orders'), where('customer.id', "==", user.uid), orderBy("ordered_on", 'desc')), snapshot => {
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


        // setIsLoading(false)
    }
    const createOrder = async (newProduct, setLoading) => {

        setLoading(true)
        console.log("product", newProduct)
        addDoc(collection(db, 'Orders'), newProduct)
            .then(async res => {
                updateDoc(doc(db, 'Orders', res.id), {
                    orderId: res.id,
                    tracking_number: res.id,
                    customer_id: user.uid,
                    ordered_on: serverTimestamp(),
                    created_at: full_date,
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
                newProduct.products.forEach(async (product) => {
                    console.log("eachedhbjhjnkml,d", product.product_id)
                    const response = await getDocs(query(collectionGroup(db, 'Products'), where('id', '==', product.product_id)))
                    if (response) {
                        response.forEach(async (res) => {
                            console.log("This porduct has been got", res.data())
                            // updateDoc(doc(db,'Orders'))
                            addDoc(collection(db, 'Users', res.data().shop_id, 'Shops', res.data().shop_id, 'MyOrders'), {
                                amount: product?.subtotal,
                                billing_address: newProduct?.billing_address,
                                coupon_id: newProduct?.coupon_id,
                                ordered_on: serverTimestamp(),
                                created_at: full_date,
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

                                },
                                customer_contact: newProduct?.customer_contact,
                                customer_id: user.uid,
                                delivery_fee: 0,
                                delivery_time: newProduct?.delivery_time,
                                reference_orderId: res.id,
                                paid_total: product?.subtotal,
                                payment_gateway: newProduct?.payment_gateway,
                                products: [{
                                    order_quantity: product.order_quantity,
                                    product_id: product.product_id,
                                    subtotal: product.subtotal,
                                    unit_price: product.unit_price,
                                    name: res.data()?.name,
                                    image: res.data()?.image
                                }],
                                sales_tax: 0,
                                shipping_address: newProduct?.shipping_address,
                                shop_id: res.data().shop_id,
                                status: newProduct?.status,
                                // tracking_number: res.id,
                                use_wallet_points: newProduct?.use_wallet_points,
                                vendor_id: newProduct?.vendor_id,
                            })
                                .then(response => {
                                    updateDoc(doc(db, 'Users', res.data().shop_id, 'Shops', res.data().shop_id, 'MyOrders', response.id), {

                                        orderId: response.id,
                                        tracking_number: response.id
                                    })
                                    updateDoc(doc(db, 'Orders', res.id), {
                                        shops: arrayUnion([{ shop_id: res.data()?.shop_id, name: res.data()?.shop?.name, logo: res.data()?.shop?.name }])
                                    })
                                    updateDoc(doc(db, 'Users', res.data().shop_id, 'Shops', res.data().shop_id, 'Products', product.product_id), {
                                        quantity: increment(-product.order_quantity)

                                    })
                                    updateDoc(doc(db, 'Users', res.data().shop_id, 'Shops', res.data().shop_id), {
                                        orders_count: increment(1)
                                    })

                                })
                                .catch(error => {

                                })


                        })
                    }
                })


                // newProduct.products.forEach(async product => {
                //     onSnapshot(query(collectionGroup(db, 'Products'), where("id", "==", product.product_id)), snapshot => {
                //         let data = []
                //         snapshot.forEach(doc => {
                //             data.push(doc.data())
                //         })
                //         console.log("pshop is comeas got is", data[0].shop_id)
                //         updateDoc(doc(db, 'Users', data[0].shop_id, 'Shops', data[0].shop_id, 'Products', product.product_id), {
                //             quantity: increment(-product.order_quantity)
                //         })
                //         addDoc(collection(db, 'Users', data[0].shop_id, 'Shops', data[0].shop_id, 'Orders'), {
                //             amount: product?.subtotal,
                //             billing_address: newProduct?.billing_address,
                //             coupon_id: newProduct?.coupon_id,
                //             customer: {
                //                 "id": user.uid,
                //                 "name": user.displayName,
                //                 "email": user.email,
                //                 "profile": {
                //                     "avatar": {
                //                         "thumbnail": user?.photoURL,
                //                         "original": user?.photoURL,

                //                     }
                //                 }

                //             },
                //             customer_contact: newProduct?.customer_contact,
                //             customer_id: user.uid,
                //             delivery_fee: 0,
                //             delivery_time: newProduct?.delivery_time,
                //             orderId: res.id,
                //             paid_total: "",
                //             payment_gateway: newProduct?.payment_gateway,
                //             products: [product],
                //             sales_tax: 0,
                //             shipping_address: newProduct?.shipping_address,
                //             shop_id: newProduct?.shop_id,
                //             status: newProduct?.status,
                //             tracking_number: res.id,
                //             use_wallet_points: newProduct?.use_wallet_points,
                //             vendor_id: newProduct?.vendor_id,
                //         })
                //             .then((res) => {
                //                 console.log("finished")



                //             })
                //             .catch(error => {
                //                 console.log(error.code)

                //             })



                //     })
                // })

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


    const updateUserEmailAndName = (data,setLoading,onClose) => {
        setLoading(true)
        updateDoc(doc(db, 'Users', user.uid), {
            email: data?.email,
            userName: data?.name,
            name: data?.name
        })
        .then(()=>{
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
        .catch(err=>{
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
        setLoading(true)
        console.log("address", address)
        updateDoc(doc(db, 'Users', user.uid), {
            "address": [address]
        })
            .then(res => {

                setLoading(false)
                toast.success("Saved Sucessfully")
                getUserInfo()
                closeModal()

            })
            .catch(error => {

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
    const [contact,setContact] = useState("")
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
                alert("phone", error.message)
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
                    alert('Updating Customer')
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
                .then(()=>{
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
                .catch((error)=>{
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
                productId,
                updateUserProfile,
                updateUserContact,
                updateUserAddress,
                createOrder,
                setProductId,
                productDetails,
                setProductDetails,
                updateUserEmailAndName,
                getProductDetails,
                trackProduct, loginUser,
                productDetails,
            }} >
            {children}
        </GlobalContext.Provider>
    )
}
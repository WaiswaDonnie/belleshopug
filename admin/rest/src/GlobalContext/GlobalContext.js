import React, { useContext, createContext, useState, useLayoutEffect } from 'react'
import { collection, deleteDoc, limit, increment, collectionGroup, getDocs, getDoc, doc, setDoc, updateDoc, onSnapshot, serverTimestamp, query, where, addDoc, orderBy } from 'firebase/firestore';
import { db, auth, storage } from '../../firebase'
import { getAuth, sendPasswordResetEmail, sendEmailVerification, signInWithPopup, signInWithEmailAndPassword, GoogleAuthProvider, signOut, RecaptchaVerifier, updateProfile, signInWithPhoneNumber, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router"
import { getStorage, ref, uploadBytesResumable, getDownloadURL, uploadBytes } from "firebase/storage";

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
// import { API_ENDPOINTS } from './client/api-endpoints';

import { useEffect } from 'react';
import { forEach, stubFalse } from 'lodash';

export const GlobalContext = createContext()



export default function GlobalContextProvider({ children }) {
    const navigate = useRouter()
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    // const { setToken } = useToken();
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

    function uploadImageAsPromise(file, setFiles) {
        const er = []
        return new Promise(function (resolve, reject) {
            const storageRef = ref(storage, `users/${user.uid}/attachments/${file.name}`);
            console.log("file to be uploaded", file)

            const uploadTask = uploadBytesResumable(storageRef, file);
            uploadTask.on('state_changed',
                (snapshot) => {

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


                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        console.log('File available at', downloadURL);
                        er.push({
                            thumbnail: downloadURL,
                            original: downloadURL,
                            id: downloadURL
                        })
                        setLoading(false)
                        setFiles(er)
                        resolve(downloadURL)

                    });
                }
            )

        });
    }


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
                        "created_at": new Date(),
                        "updated_at": new Date()
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
    const getProductDetails = async (productId) => {
        if (productId) {
            onSnapshot(query(collectionGroup(db, 'Products'), where("slug", "==", productId)), snapshot => {
                let data = []
                snapshot.forEach(doc => {
                    data.push(doc.data())
                })
                console.log("product", data)
                // setClientProduct(data)
                setProductDetails(data)
            })
            // onSnapshot(query(collectionGroup(db, 'Products'), where("slug", "==", productId)), snapshot => {
            //     let data = []
            //     snapshot.forEach(doc => {
            //         data.push(doc.data())
            //     })
            //     console.log("product got is", data)
            //     setProductDetails(data[0])

            // })
        }
    }
    const createUser = async (username, email, password, setLoading, setAuthCredentials, routes) => {
        console.log(username, email, password)
        setLoading(true)
        // setAuthCredentials(data?.token, data?.permissions)

        createUserWithEmailAndPassword(auth, email, password)
            .then(async userCredentials => {
                updateProfile(auth.currentUser, {
                    displayName: username
                })
                setUser(userCredentials.user)
                setDoc(doc(db, 'Vendors', userCredentials.user.uid), {
                    name: username,
                    id: userCredentials.user.uid,
                    created_at: serverTimestamp(),
                    email: email,
                    profile: {
                        avatar: null,
                        bio: null,
                        contact: null,

                    },
                    is_active:true,
                })
                    .then(async result => {
                        setLoading(false)
                        setUser(userCredentials.user)
                        userCredentials.user.getIdToken()
                            .then(token => {
                                updateDoc(doc(db, 'Vendors', userCredentials.user.uid), {
                                    token: token
                                })
                                // {%22token%22:%22jwt%20token%22%2C%22permissions%22:[%22super_admin%22%2C%22customer%22]}
                                Cookies.set('AUTH_CRED', "{%22token%22:%22jwt%20token%22%2C%22permissions%22:[%22super_admin%22%2C%22customer%22]}")
                                setToken(token);
                                setAuthCredentials(token, 'STORE_OWNER')
                                navigate.push('/login')
                                toast.success("Account Creates Sucessfully")
                            })
                            .catch(error => { })

                        // navigate.push('/makeup')




                    })
                    .catch(error => {
                        setLoading(false)
                        console.log("setting doc", error)
                        // setFormError(error.code)
                        toast.error((error.code));
                    })
            }).catch(error => {
                setLoading(false)
                console.log(error.code)
                // setFormError(error.code)
                toast.error((error.code));
            })
    }


    const updateUser = (newUser, setLoading) => {
        setLoading(true)
        console.log("newUser", newUser.input)
        updateDoc(doc(db, 'Vendors', user.uid), newUser.input)
            .then(res => {

                setLoading(false)
                toast.success("Saved Sucessfully")
                getUserInfo()

            })
            .catch(error => {

            })

    }

    const logoutUser = () => {
        signOut(auth).then(() => {
            // Sign-out successful.
            console.log('called')
            setUser(null)
            setMyOrders([])
            setShops([])
        }).catch((error) => {
            // An error happened.
        });
    }

    const loginUser = async (email, password, setLoading, hasAccess, allowedRoles, Routes, setAuthCredentials, setErrorMessage) => {
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

                        setToken(token);
                        // setLoading(false)
                        // closeModal();
                        // setAuthorized(true)
                        if (token) {
                            if (hasAccess(
                                allowedRoles,
                                [
                                    "super_admin",
                                    "customer"
                                ])) {
                                setAuthCredentials(token,
                                    [
                                        "super_admin",
                                        "customer"
                                    ]);
                                setUser(userCredentials.user)
                                navigate.push(Routes.dashboard);
                                return;
                            }
                            setErrorMessage('form:error-enough-permission');
                        } else {
                            setErrorMessage('form:error-credential-wrong');
                        }

                    })
                    .catch(error => {
                        toast.error((error.code));
                        setErrorMessage('form:error-credential-wrong');
                    })






            }).catch(error => {
                setLoading(false)
                console.log(error.code)
                setErrorMessage('form:error-credential-wrong');
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



    const createShop = (newShop, setIsLoading) => {
        console.log(newShop.values)
        setIsLoading(true)
        setDoc(doc(db, 'Vendors', user.uid, 'Shops', user.uid), {
            cover_image: {
                original: newShop.values.cover_image.original,
                thumbnail: newShop.values.cover_image.thumbnail
                // original: newShop.values.cover_image.original,
                // thumbnail: newShop.values.cover_image.thumbnail
            },
            name: newShop.values.name,
            description: newShop.values.description,
            logo: newShop?.values?.logo,
            owner_id: user?.uid,
            id: user?.uid,
            createdOn: serverTimestamp(),
            is_active: false,
            orders_count: 0,
            products_count: 0,
            owner:{
                name:user?.displayName,
                avatar:user?.photoURL
            }
        })
            .then(res => {
                toast.success("Shop Created")
                setIsLoading(false)
                getShopDetails()

                updateDoc(doc(db, 'Venders', user.uid), {
                    shop:{
                        name: newShop.values.name,
                        description: newShop.values.description,
                        logo: newShop?.values?.logo,
                        owner_id: user.uid,
                        id: user.uid,
                        createdOn: serverTimestamp(),                  
                    }
                })
                    .then(res => { })
                    .catch(error => { })
                
                navigate.push('/shops')
            })
            .catch(error => {
                toast.error(error.code)
                setIsLoading(false)
            })

    }

    const updateShop = async (newShop, setIsLoading) => {
        setIsLoading(true)
        console.log("Shop to edit", newShop)
        delete newShop['balance']
        updateDoc(doc(db, 'Vendors', user.uid, 'Shops', newShop.id), newShop)
            .then(() => {
                toast.success("Updated Sucessfully")
                setIsLoading(false)
                navigate.push('/shops')
            })
            .catch(error => {
                setIsLoading(false)
            })

    }

    const [shopDetails, setShopDetails] = useState(null)

    useEffect(() => {
        if (user) {
            console.log("auth", user.uid)
            getShopDetails()
        }
    }, [user])


    const getShopDetails = () => {
        getDoc(query(doc(db, 'Vendors', user.uid, 'Shops', user.uid)))
            .then(res => {
                setShopDetails(res.data())
                console.log("shop details are all here", res.data())
            })
    }

    const [shops, setShops] = useState([])
    const getShops = async () => {
        onSnapshot(collection(db, 'Vendors', user.uid, 'Shops'), snap => {
            let data = [];
            snap.forEach(doc => {
                data.push(doc.data())
            })
            setShops(data)
        })
    }
    const [shopInfo, setShopInfo] = useState(null)
    const getShopInfo = async (id, setLoading) => {
        setLoading(true)
        onSnapshot(query(collection(db, 'Vendors', id, 'Shops'), where("id", "==", id)), snapshot => {
            let data = [];
            snapshot.forEach(doc => {
                data.push(doc.data())
            })
            setShopInfo(data[0])

        })
        setLoading(false)
    }
    const [productInfo, setProductInfo] = useState(null)
    const getProductInfo = async (id, setLoading) => {
        console.log("got it", id)
        setLoading(true)
        onSnapshot(query(collection(db, 'Vendors', user.uid, 'Shops', user.uid, "Products"), where("id", "==", id)), snapshot => {
            let data = [];
            snapshot.forEach(doc => {
                data.push(doc.data())
            })
            setProductInfo(data[0])
            console.log("we got", data)

        })
        setLoading(false)
    }

    const [open, setOpen] = useState(false);


    const createProduct = async (newProduct, setLoading) => {
        setLoading(true)
        console.log("newProduct.shopDetails", newProduct)
        if (shopDetails) {


            delete newProduct['author_id']
            delete newProduct['variation_options']
            delete newProduct['variations']
            delete newProduct['manufacturer_id']
            newProduct['shop'] = {
                id: shopDetails.owner_id,
                name: shopDetails.name,
                logo: shopDetails.logo
            };

            console.log("new product", newProduct)
            addDoc(collection(db, 'Vendors', user.uid, 'Shops', user.uid, 'Products'), newProduct)
                .then(res => {
                    toast.success("Product added successfully")
                    setOpen(false)
                    setLoading(false)
                    updateDoc(doc(db, 'Vendors', user.uid, 'Shops', user.uid, 'Products', res.id), {
                        slug: res.id,
                        id: res.id
                    })
                    updateDoc(doc(db, 'Vendors', user.uid, 'Shops', user.uid), {
                        products_count: increment(newProduct?.quantity),

                    })
                        .then(() => { })
                        .catch(error => { })
                })
                .catch(error => {
                    toast.error(error.code)
                    setLoading(false)
                })
        } else {
            toast.error("You have no shop")
            setLoading(false)
        }

    }
    const updateProduct = async (newProduct, setLoading) => {
        setLoading(true)
        console.log("update Product", newProduct)
        // if (shopDetails) {


        //     delete newProduct['author_id']
        //     delete newProduct['variation_options']
        //     delete newProduct['variations']
        //     delete newProduct['manufacturer_id']
        //     newProduct['shop'] = {
        //         id: shopDetails.owner_id,
        //         name: shopDetails.name,
        //     };

        //     console.log("new product", newProduct)
        //     addDoc(collection(db, 'Vendors', user.uid, 'Shops', user.uid, 'Products'), newProduct)
        //         .then(res => {
        //             toast.success("Product added successfully")
        //             setOpen(false)
        //             setLoading(false)
        //             updateDoc(doc(db, 'Vendors', user.uid, 'Shops', user.uid, 'Products', res.id), {
        //                 slug: res.id,
        //                 id: res.id
        //             })
        //             updateDoc(doc(db, 'Vendors', user.uid, 'Shops', user.uid), {
        //                 products_count: increment(newProduct?.quantity),
        //                 orders_count: 0

        //             })
        //         })
        //         .catch(error => {
        //             toast.error(error.code)
        //             setLoading(false)
        //         })
        // } else {
        //     toast.error("You have no shop")
        //     setLoading(false)
        // }

    }



    const [ownerProducts, setOwnerProducts] = useState([])
    const getOwnerProducts = async () => {
        onSnapshot(collection(db, 'Vendors', user.uid, 'Shops', user.uid, 'Products'), snapshot => {
            let data = []
            snapshot.forEach(product => {
                data.push(product.data())
            })
            setOwnerProducts(data)
            console.log("products", data)
        })

    }

    const [myOrderDetails, setMyOrderDetails] = useState(null)
    const [myOrders, setMyOrders] = useState([])
    useEffect(() => {
        if (user) {
            getMyOrders()
        }
    }, [user])

    const getMyOrder = (orderId) => {
        onSnapshot(query(collectionGroup(db, 'MyOrders'), where("shop_id", '==', user.uid), where("orderId", "==", orderId)), snapshot => {
            let data = []
            snapshot.forEach(doc => {

                data.push(doc.data())
            })
            if (data.length > 0) {
                setMyOrderDetails(data[0])
                console.log("order", data[0])
            }

        })
    }


    const getMyOrders = () => {
        onSnapshot(collection(db, 'Vendors',user.uid,'Shops',user.uid,'MyOrders'), snapshot => {
            // onSnapshot(query(collection(db, 'Vendors', user.uid, 'Shops', user.uid, 'Orders')), snapshot => {
            let data = []
            snapshot.forEach(doc => {
                data.push(doc.data())
            })
            setMyOrders(data)
            console.log("my orders", data)
            // if (data.length > 0) {
            //     console.log("my orders", data)
            // }

        })

    }

    const updateMyOrder = (order, setUpdating) => {
        console.log("order to be updated", order)
        setUpdating(true)
        updateDoc(doc(db, 'Vendors', user.uid, 'Shops', user.uid, 'MyOrders', order.id), {
            status: order.status
        })
            .then(res => {
                toast.success("Sucessfully Updated")
                setUpdating(false)
            })
            .catch(error => {
                toast.error(error.code)
                setUpdating(false)
            })
        //  onSnapshot(query(collectionGroup(db, 'Orders'), where("orderId", "==", order.id)), snapshot => {
        //     let data = []
        //     snapshot.forEach(doc => {

        //         data.push(doc.data())
        //     })
        //     if (data.length > 0) {
        //         setMyOrderDetails(data[0])
        //         updateDoc()
        //         console.log("order", data[0])
        //     }

        // })

    }

    const [userInfo, setUserInfo] = useState({})

    useEffect(() => {
        if (user) {
            getUserInfo()
        }
    }, [user])
    const getUserInfo = async () => {
        if (user) {
            getDoc(doc(db, 'Vendors', user.uid))
                .then(res => {
                    console.log("user info", res.data())
                    setUserInfo(res.data())
                })
                .catch(error => {
                    console.log("user Info")
                })
        }
    }




    return (
        <GlobalContext.Provider
            value={{
                updateMyOrder,
                user,
                userInfo,
                getUserInfo,
                productInfo,
                getProductInfo,
                addProduct,
                createProduct,
                loginWithGoogle,
                shops,
                getShops,
                products,
                getProducts,
                shopDetails,
                updateUser,
                createShop,
                visible,
                loading, setLoading,
                createUser,
                uploadFiles,
                open, setOpen,
                loading,
                setVisible,
                editProduct,
                updateShop,
                myOrderDetails,
                myOrders,
                shopInfo,
                getShopInfo,
                getMyOrder,
                productId,
                ownerProducts,
                getOwnerProducts,
                createOrder,
                setProductId,
                logoutUser,
                updateProduct,
                productDetails,
                setProductDetails,
                getProductDetails,
                trackProduct, loginUser
            }} >
            {children}
        </GlobalContext.Provider>
    )
}
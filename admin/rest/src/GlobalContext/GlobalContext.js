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
            // files.forEach(async (file) => {
            //     const storageRef = ref(storage, `users/${user.uid}/attachments/${file.name}`);
            //     console.log("file to be uploaded", files)

            //     const uploadTask = uploadBytesResumable(storageRef, file);
            //     uploadTask.on('state_changed',
            //         (snapshot) => {

            //             const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            //             console.log('Upload is ' + progress + '% done');
            //             switch (snapshot.state) {
            //                 case 'paused':
            //                     console.log('Upload is paused');
            //                     break;
            //                 case 'running':
            //                     console.log('Upload is running');
            //                     break;
            //             }
            //         },
            //         (error) => {
            //             // Handle unsuccessful uploads

            //         },
            //         () => {


            //             getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            //                 console.log('File available at', downloadURL);
            //                 setLoading(false)
            //                 customFiles.push({
            //                     thumbnail: downloadURL,
            //                     original: downloadURL,
            //                     id: downloadURL
            //                 })
            //                 console.log()
            //             });
            //         }
            //     )
            //     if (customFiles.length > 0) {
            //         console.log("total files uploaded", customFiles)
            //     }
            // })

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


        // setFiles(customFiles)
        // console.log("leng", customFiles.length)
        // console.log("lengs", files.length)
        //  if(customFiles.length === files.length -1){
        //     setLoading(false)
        //  }
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
    const getProductDetails = async (productId) => {
        if (productId) {
            onSnapshot(query(collectionGroup(db, 'Products'), where("slug", "==", productId)), snapshot => {
                let data = []
                snapshot.forEach(doc => {
                    data.push(doc.data())
                })
                console.log("product", data)
                setClientProduct(data)
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
                                updateDoc(doc(db, 'Vendors', userCredentials.user.uid), {
                                    token: token
                                })
                                // {%22token%22:%22jwt%20token%22%2C%22permissions%22:[%22super_admin%22%2C%22customer%22]}
                                Cookies.set('AUTH_CRED', "{%22token%22:%22jwt%20token%22%2C%22permissions%22:[%22super_admin%22%2C%22customer%22]}")
                                setToken(token);
                                setAuthCredentials(token, 'STORE_OWNER')
                                navigate.push(routes)
                                toast.success("Logged In")
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
                original: newShop.values.orignal ? newShop.values.orignal : "sdas",
                thumbnail: newShop.values.thumbnail ? newShop.values.original : "adftgdf"
                // original: newShop.values.cover_image.original,
                // thumbnail: newShop.values.cover_image.thumbnail
            },
            name: newShop.values.name,
            description: newShop.values.description,
            logo: newShop.values.logo ? newShop.values.logo : "asdasd",
            owner_id: user.uid,
            createdOn: serverTimestamp()
        })
            .then(res => {
                toast.success("Shop Created")
                setIsLoading(false)
                getShopDetails()
            })
            .catch(error => {
                toast.error(error.code)
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
    const [open, setOpen] = useState(false);


    const createProduct = async (newProduct, setLoading) => {
        setLoading(true)
        console.log("newProduct.shopDetails",newProduct)
        if (shopDetails) {


            delete newProduct['author_id']
            delete newProduct['variation_options']
            delete newProduct['variations']
            delete newProduct['manufacturer_id']
            newProduct['shop'] = {
                id: shopDetails.owner_id,
                name: shopDetails.name,
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
        onSnapshot(query(collection(db, 'Orders'), where("orderId", "==", orderId)), snapshot => {
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
        onSnapshot(query(collection(db, 'Orders')), snapshot => {
            // onSnapshot(query(collection(db, 'Vendors', user.uid, 'Shops', user.uid, 'Orders')), snapshot => {
            let data = []
            snapshot.forEach(doc => {

                data.push(doc.data())
            })
            if (data.length > 0) {
                setMyOrders(data)
                console.log("my orders", data)
            }

        })
    }

    const updateMyOrder = (order, setUpdating) => {
        console.log("order to be updated", order)
        setUpdating(true)
        updateDoc(doc(db, 'Orders', order.id), {
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




    return (
        <GlobalContext.Provider
            value={{
                updateMyOrder,
                user,
                addProduct,
                createProduct,
                loginWithGoogle,
                products,
                getProducts,
                shopDetails,
                createShop,
                visible,
                loading, setLoading,
                createUser,
                uploadFiles,
                open, setOpen,
                loading,
                setVisible,
                editProduct,
                myOrderDetails,
                myOrders,
                getMyOrder,
                productId,
                ownerProducts,
                getOwnerProducts,
                createOrder,
                setProductId,
                productDetails,
                setProductDetails,
                getProductDetails,
                trackProduct, loginUser
            }} >
            {children}
        </GlobalContext.Provider>
    )
}
import { collection, deleteDoc, limit, increment, collectionGroup, getDocs, getDoc, doc, setDoc, updateDoc, onSnapshot, serverTimestamp, query, where, addDoc, orderBy } from 'firebase/firestore';
import { db, auth, storage } from '../firebase'
import { getAuth, sendPasswordResetEmail, sendEmailVerification, signInWithPopup, signInWithEmailAndPassword, GoogleAuthProvider, signOut, RecaptchaVerifier, updateProfile, signInWithPhoneNumber, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
 import Cookies from 'js-cookie'
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

import { createContext, useLayoutEffect, useEffect, useState } from 'react';
export const GlobalContext = createContext()

export default function GlobalContextProvider({ children }) {
    const [user, setUser] = useState()
    const navigate = useNavigate();

    const [token, setToken] = useState()
    useLayoutEffect(() => {
        onAuthStateChanged(auth, authUser => {
            if (authUser) {
                // navigate.push('/makeup')
                setUser(authUser)
            }
        })
    }, [user])
    useEffect(() => {
        if (user) {
            getShops()
            getVendors()
            getOrders()
            getProducts()
        }
    }, [user])
    const [shops, setShops] = useState([])
    const getShops = async () => {
        onSnapshot(collectionGroup(db, 'Shops'), snap => {
            let data = [];
            snap.forEach(doc => {
                data.push(doc.data())
            })
            setShops(data)
        })
    }

    const [clientProducts, setClientProducts] = useState([])
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

    const [orders, setOrders] = useState([])
    const getOrders = async () => {
        onSnapshot(collectionGroup(db, 'Orders'), snap => {
            let data = [];
            snap.forEach(doc => {
                data.push(doc.data())
            })
            setOrders(data)
        })
    }
    const [shopInfo, setShopInfo] = useState(null)
    const getShopInfo = async (id, setLoading) => {
        setLoading(true)
    
        onSnapshot(query(collectionGroup(db, 'Shops'), where("owner_id", "==", id)), snapshot => {
            let data = [];
            snapshot.forEach(doc => {
                data.push(doc.data())
            })
            setShopInfo(data[0])
            console.log("shop",data[0])

        })
        setLoading(false)
    }
    const activateShop = async (id, setIsLoading) => {
        setIsLoading(true)
        updateDoc(doc(db, 'Vendors', id, 'Shops', id), {
            is_active: true
        })
            .then(() => {
                toast.success("Activated Sucessfully")
                setIsLoading(false)
                // navigate.push('/shops')
            })
            .catch(error => {
                setIsLoading(false)
            })

    }
    const deactivateShop = async (id, setIsLoading) => {
        setIsLoading(true)
         

        updateDoc(doc(db, 'Vendors',id, 'Shops', id), {
            is_active: false
        })
            .then(() => {
                toast.success("Deactivated Sucessfully")
                setIsLoading(false)
                // navigate.push('/shops')
            })
            .catch(error => {
                setIsLoading(false)
            })

    }
    const logoutUser = () => {
        signOut(auth).then(() => {
            // Sign-out successful.
            console.log('called')
            setUser(null)

            setShops([])
            setVendors([])
            Cookies.remove('admin_token')
            navigate('/login')
        }).catch((error) => {
            // An error happened.
        });
    }

    const deleteShop = async (newShop, setIsLoading) => {
        setIsLoading(true)
        console.log("Shop to edit", newShop)

        deleteDoc(doc(db, 'Vendors', newShop.id, 'Shops', newShop.id))
            .then(() => {
                toast.success("Deleted Sucessfully")
                setIsLoading(false)
                // navigate.push('/shops')
            })
            .catch(error => {
                setIsLoading(false)
            })

    }

    const loginUser = async (email, password, setLoading) => {
        console.log(email, password)
        setLoading(true)
        signInWithEmailAndPassword(auth, email, password)
            .then(async userCredentials => {
                setUser(userCredentials.user)
                userCredentials.user.getIdToken()
                    .then(token => {

                        Cookies.set('admin_token', token)
                        setToken(token);
                        setLoading(false)
                        navigate('/dashboard/app', { replace: true });


                    })
                    .catch(error => {
                        toast.error((error.code));
                    })

            }).catch(error => {
                setLoading(false)
                console.log(error.code)

                toast.error((error.code));
            })
    }

    const [vendors, setVendors] = useState([])
    const getVendors = async () => {
        onSnapshot(collectionGroup(db, 'Vendors'), snap => {
            let data = [];
            snap.forEach(doc => {
                data.push(doc.data())
            })
            setVendors(data)
            console.log("vendors", data)
        })
    }
    const [shopProducts, setShopProducts] = useState([])
    
    const getShopProducts = async (id,setLoading) => {
        setLoading(true)
    //  getDocs(collectionGroup(db,'Products'))
    //  .then((re)=>{
    //         re.
    //  })
    //  .catch((err))
        // onSnapshot(collectionGroup(db, 'Products'), snapshot => {
        //     let data = [];
        //     snapshot.forEach(doc => {
        //         data.push(doc.data())
        //     })
        //     setShopProducts(data)
        //     console.log("prpducts",data)

        // })
        // setLoading(false)
        setLoading(true)
    
        onSnapshot(query(collectionGroup(db, 'Products'), where("shop_id", "==", id)), snapshot => {
            let data = [];
            snapshot.forEach(doc => {
                data.push(doc.data())
            })
            setShopProducts(data)
            console.log("products",data)

        })
        setLoading(false)
    }
    return (
        <GlobalContext.Provider
            value={{
                loginUser,
                shops,
                vendors,
                activateShop, 
                shopProducts,
                getShopProducts,
                deactivateShop,
                deleteShop,
                getShops,
                orders,
                shopInfo,
                getShopInfo,
                logoutUser,
                clientProducts
            }}
        >
            {children}
        </GlobalContext.Provider>
    )

}
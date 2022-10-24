import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { Container, Grid } from '@mui/material';

// import PersonIcon from '@mui/icons-material/Person';
// import AddIcon from '@mui/icons-material/Add';
import Typography from '@mui/material/Typography';
import { blue } from '@mui/material/colors';
import { collectionGroup, getDocs, query, where,doc,getDoc } from 'firebase/firestore';
import { db } from 'src/firebase';
import ShopCard from '../shopCard';

const emails = ['username@gmail.com', 'user02@gmail.com'];

export default function SimpleDialog(props) {
    const { onClose, selectedValue, open, products } = props;
    const [customProducts, setCustomProducts] = React.useState([])

    const handleClose = () => {
        onClose(selectedValue);
    };

    const handleListItemClick = (value) => {
        onClose(value);
    };

    React.useEffect(() => {
        getDreol()
    }, [])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getDreol = () => {
        products.forEach(async (product) => {
             const response = await getDocs(query(collectionGroup(db, 'Products'), where('id', '==', product.product_id)))
            if (response) {
                let data = []
                response.forEach(async (res) => {
                    // data.push(res.data())
              
                    const shopInfo = await getDoc(doc(db,'Users',res.data()?.shop.id,'Shops',res.data()?.shop.id))
                    console.log("shop info",shopInfo.data()); 
                    data.push(shopInfo.data())
                    setCustomProducts([...products,shopInfo.data()])
                })
                // alert(data) 
                setCustomProducts(data)
            }

        })
    }




    return (
        <Dialog fullWidth maxWidth="md" onClose={handleClose} open={open}>
            <DialogTitle>Shops</DialogTitle>
            <Container style={{
                padding:'20px 10px',
            }}>

                <Grid container spacing={4} >

                    
                    {customProducts.map((product,index) => (
                        <Grid key={product?.id} item xs={12} sm={6} md={4}>
                            {index !== 0 && <ShopCard shop={product} /> }
                            
                        </Grid>
                    ))}
                </Grid>



                {/* <ProductCartWidget /> */}

            </Container>
        </Dialog>
    );
}

SimpleDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    selectedValue: PropTypes.string.isRequired,
};
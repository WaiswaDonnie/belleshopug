import { useContext, useState, useEffect } from 'react';
// material
import { Container, Stack, Typography } from '@mui/material';
// components
import Page from '../components/Page';
import { ProductSort, ProductList, ProductCartWidget, ProductFilterSidebar } from '../sections/@dashboard/products';
// mock
import PRODUCTS from '../_mock/products';
import { GlobalContext } from 'src/GlobalContext/GlobalContext';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams
} from "react-router-dom";
 // ----------------------------------------------------------------------

export default function EcommerceShop() {
  const [openFilter, setOpenFilter] = useState(false);
  const { shopProducts, getShopProducts, user, shopInfo, getShopInfo } = useContext(GlobalContext)
  let { id } = useParams();
  const [loading, setLoading] = useState(false)
  console.log("id", id)
  useEffect(() => {
    if (id) {
      getShopInfo(id, setLoading)
    }

  }, [user, id])

  useEffect(() => {
    if (shopInfo) {
      getShopProducts(id, setLoading)
    }

  }, [ id, shopInfo])

  const handleOpenFilter = () => {
    setOpenFilter(true);
  };

  const handleCloseFilter = () => {
    setOpenFilter(false);
  }; 

  return (
    <Page title="Dashboard: Products">
     {/* <ShopHeader /> */}
      <Container>
        
        <Typography variant="h4" sx={{ mb: 5 }}>
          {shopInfo?.name} Products
        </Typography>

        <Stack direction="row" flexWrap="wrap-reverse" alignItems="center" justifyContent="flex-end" sx={{ mb: 5 }}>
          <Stack direction="row" spacing={1} flexShrink={0} sx={{ my: 1 }}>
            {/* <ProductFilterSidebar
              isOpenFilter={openFilter}
              onOpenFilter={handleOpenFilter}
              onCloseFilter={handleCloseFilter}
            /> */}
            {/* <ProductSort /> */}
          </Stack>
        </Stack>

        <ProductList products={shopProducts} />
        {/* <ProductCartWidget /> */}
      </Container>
    </Page>
  );
}

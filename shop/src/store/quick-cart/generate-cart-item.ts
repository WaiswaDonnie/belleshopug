import isEmpty from 'lodash/isEmpty';
interface Item {
  id: string | number;
  name: string;
  slug: string;
  image: {
    thumbnail: string;
    [key: string]: unknown;
  };
  price: number;
  sale_price?: number;
  quantity?: number;
  [key: string]: unknown;
  language: string;
  title: string;
  album: string[];
  unit_price?: number;
  subtotal?: number;
  categoryList?:string[];
  description?:string;
  discount?: number;
  discountedPrice?: number;
  savedPrice?: number;
  status?:string;
  type?: any;
  imageUrl?:string;
  influencerDiscount?:number;
  influencerId?:string;
  influencerImageUrl?:string;
  influencerName?:string;
  brand?: string;
  shopId?: string;
  
}
interface Variation {
  // id: string | number;
  // title: string;
  // price: number;
  // sale_price?: number;
  // quantity: number;
  // [key: string]: unknown;
  id: string | number;
  name: string;
  slug: string;
  image: {
    thumbnail: string;
    [key: string]: unknown;
  };
  price: number;
  sale_price?: number;
  quantity?: number;
  [key: string]: unknown;
  language: string;
  title: string;
  album: string[]
}
export function generateCartItem(item: Item, variation: Variation) {
  const {
    id,
     title,
    slug,
     price,
    sale_price,
    album,
    quantity,
    unit,
    is_digital,
    language,
    description,
    discount,
    discountedPrice,
    savedPrice,
    status,
    type,
    influencerDiscount,
    influencerId,
    influencerImageUrl,
    influencerName,
    brand,
    categoryList,
    shopId,
    
  
  } = item;
 
 
  if (!isEmpty(variation)) {
    return {
      id: `${id}.${variation.id}`,
      productId: id,
      name: `${title} - ${variation.title}`,
      slug,
      unit,
      is_digital: variation?.is_digital,
      stock: variation.quantity,
      price: Number(
        variation.sale_price ? variation.sale_price : variation.price
      ),
      image: album?.[0],
      variationId: variation.id,
      language
    };
  }
  return {
    id,
    name:title,
    slug,
    unit,
    is_digital,
    image: album?.[0],
    stock: quantity,
    price: Number(sale_price ? sale_price : price),
    language,
    description,
    discount,
    discountedPrice,
    savedPrice,
    status,
    type,
    influencerDiscount,
    influencerId,
    influencerImageUrl,
    influencerName,  
    brand,
    shopId,
    categoryList

  };
}

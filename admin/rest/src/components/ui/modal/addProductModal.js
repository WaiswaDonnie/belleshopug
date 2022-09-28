import ProductForm from '@/components/product/product-form'
import React from 'react'
import Input from '../input'
import Modal from './modal'
function AddProductModal({open,onClose}) {
  return (
    <Modal open={open} onClose={onClose}>
        <div className="h-[100%] px-10 py-5 w-[fit-content] bg-white ">
             <ProductForm />
        </div>
    </Modal>
  )
}

export default AddProductModal
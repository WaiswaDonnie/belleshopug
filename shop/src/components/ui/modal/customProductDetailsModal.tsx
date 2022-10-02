import React from 'react'
import Modal from '@/components/ui/modal/modal';
import Card from '../cards/card';
import Details from '@/components/products/details/details'
function CustomProductDetailsModal({onClose,open,product}) {
  return (
    <Modal open={open} onClose={onClose}>
      <Card className="flex w-full flex-col">
        <Details product={product} onClose={onClose} />
      </Card>
    </Modal>
  )
}

export default CustomProductDetailsModal
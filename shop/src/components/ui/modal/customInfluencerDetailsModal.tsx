import React from 'react'
import Modal from '@/components/ui/modal/modal';
import Card from '../cards/card';
import Details from '@/components/products/details/influencerDetails'
function CustomInfluencerDetailsModal({onClose,open,influencer}) {
  return (
    <Modal open={open} onClose={onClose}>
      <Card className="flex w-full flex-col">
        <Details influencer={influencer} onClose={onClose} />
      </Card>
    </Modal>
  )
}

export default CustomInfluencerDetailsModal
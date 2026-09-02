import Collection from '../sections/Collection'
import Gifting from '../sections/Gifting'

// Focused shopping experience: the full catalogue + gift boxes.
export default function Shop() {
  return (
    <div className="pt-6">
      <Collection />
      <Gifting />
    </div>
  )
}

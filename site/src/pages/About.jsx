import Story from '../sections/Story'
import Ingredients from '../sections/Ingredients'

// Brand story + what's inside. Story carries the baking video (mobile-safe).
export default function About() {
  return (
    <div className="pt-6">
      <Story />
      <Ingredients />
    </div>
  )
}

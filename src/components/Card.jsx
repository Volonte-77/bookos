import { Card as FlowbiteCard } from 'flowbite-react'

function Card({ children, elevated = false, className = '', ...props }) {
  const classes = `card ${elevated ? 'card-elevated' : ''} ${className}`.trim()

  return (
    <FlowbiteCard className={classes} {...props}>
      {children}
    </FlowbiteCard>
  )
}

export default Card

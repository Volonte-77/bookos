import { Badge as FlowbiteBadge } from 'flowbite-react'

function Badge({ children, className = '', ...props }) {
  const classes = `badge ${className}`.trim()

  return (
    <FlowbiteBadge className={classes} {...props}>
      {children}
    </FlowbiteBadge>
  )
}

export default Badge

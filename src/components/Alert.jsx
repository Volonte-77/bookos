import { Alert as FlowbiteAlert } from 'flowbite-react'

function Alert({ children, className = '', ...props }) {
  const classes = `alert ${className}`.trim()

  return (
    <FlowbiteAlert className={classes} {...props}>
      {children}
    </FlowbiteAlert>
  )
}

export default Alert

import { Button as FlowbiteButton, Spinner } from 'flowbite-react'

const variantClasses = {
  primary: 'btn btn-primary bg-brand',
  secondary: 'btn btn-secondary',
  outline: 'btn btn-outline',
  ghost: 'btn btn-ghost',
}

function Button({
  children,
  variant = 'primary',
  loading = false,
  className = '',
  ...props
}) {
  const classes = `${variantClasses[variant] || variantClasses.primary} ${className}`.trim()

  return (
    <FlowbiteButton
      className={classes}
      data-loading={loading}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : null}
      <span>{children}</span>
    </FlowbiteButton>
  )
}

export default Button

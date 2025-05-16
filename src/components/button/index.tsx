import { StyledButton } from './_buttonStyle'
import { MarginProps } from 'Consts/sizing'

interface ButtonProps extends MarginProps {
  children: React.ReactNode
  size?: 's' | 'm' | 'l'| 'xs'
  onClick?: () => void
  fullWidth?: boolean
  type?: any
  isLoading?: boolean
  disabled?: boolean;
}

function Button(props: ButtonProps) {
  const { children } = props
  return <StyledButton {...props}>{children}</StyledButton>
}

export default Button

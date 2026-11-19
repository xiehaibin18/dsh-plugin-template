import { Button as BaseButton } from '@base-ui/react/button'
import { Input as BaseInput } from '@base-ui/react/input'
import { Switch as BaseSwitch } from '@base-ui/react/switch'
import { forwardRef, type ComponentPropsWithoutRef } from 'react'

// Local shadcn-style wrappers compose Base UI behavior with scoped styles.
export const Button = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<'button'>>(
  function Button({ type = 'button', ...props }, ref) {
    return <BaseButton {...props} ref={ref} type={type} className="dsh-example-button" />
  },
)

export const Input = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<'input'>>(
  function Input(props, ref) {
    return <BaseInput {...props} ref={ref} className="dsh-example-input" />
  },
)

export function Switch(props: { id: string; checked: boolean; disabled?: boolean; onCheckedChange: (checked: boolean) => void }) {
  return (
    <BaseSwitch.Root
      {...props}
      nativeButton
      render={<button type="button" />}
      className="dsh-example-switch"
    >
      <BaseSwitch.Thumb className="dsh-example-switch-thumb" />
    </BaseSwitch.Root>
  )
}

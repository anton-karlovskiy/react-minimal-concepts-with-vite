function Button({ className = "", disabled, ...rest }: React.ComponentPropsWithRef<'button'>) {
  const cursorClass = disabled ? 'cursor-default' : 'cursor-pointer';
  return (
    <button 
      className={`rounded-lg px-3 py-2 border border-[#2b2e35] bg-[#1d1f24] text-[#f5f7fb] ${cursorClass} ${className}`}
      disabled={disabled}
      {...rest} />
  );
}

export default Button;
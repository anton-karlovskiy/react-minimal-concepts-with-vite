function Button({ className = "", ...rest }: React.ComponentPropsWithRef<'button'>) {
  return (
    <button 
      className={`rounded-lg px-3 py-2 border border-[#2b2e35] bg-[#1d1f24] text-[#f5f7fb] cursor-pointer ${className}`}
      {...rest} />
  );
}

export default Button;
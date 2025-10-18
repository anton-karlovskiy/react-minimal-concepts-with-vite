function Small({ className = "", ...rest }: React.ComponentPropsWithRef<'small'>) {
  return (
    <small 
      className={`text-[#a3a9b7] ${className}`}
      {...rest} />
  );
}

export default Small;

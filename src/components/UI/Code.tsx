function Code({ className = "", ...rest }: React.ComponentPropsWithRef<'code'>) {
  return (
    <code 
      className={`bg-[#0f1115] px-1 py-0.5 rounded-md ${className}`}
      {...rest} />
  );
}

export default Code;

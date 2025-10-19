function Code({ className = "", ...rest }: React.ComponentPropsWithRef<'code'>) {
  return (
    <code 
      className={`bg-[#393f4b] px-1 py-0.5 rounded-md ${className}`}
      {...rest} />
  );
}

export default Code;

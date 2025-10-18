function DemoTitle({ className = "", ...rest }: React.ComponentPropsWithRef<'h2'>) {
  return (
    <h2 className={`my-2 ${className}`} {...rest} />
  );
}

export default DemoTitle;
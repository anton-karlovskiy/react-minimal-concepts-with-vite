function Textarea({ className = "", ...rest }: React.ComponentPropsWithRef<'textarea'>) {
  return (
    <textarea 
      className={`w-full p-2 rounded-lg border border-[#2b2e35] bg-[#0f1115] text-[#f5f7fb] ${className}`}
      {...rest} />
  );
}

export default Textarea;
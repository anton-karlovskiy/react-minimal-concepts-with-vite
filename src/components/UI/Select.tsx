// ninja focus touch <
interface SelectProps extends React.ComponentPropsWithRef<'select'> {
  className?: string;
}

function Select({ className = "", children, ...rest }: SelectProps) {
  return (
    <select 
      className={`w-full p-2 rounded-lg border border-[#2b2e35] bg-[#0f1115] text-[#f5f7fb] ${className}`}
      {...rest}>
      {children}
    </select>
  );
}

export default Select;
// ninja focus touch >
import cls from "./Button.module.css";

const Button = ({ variant = "primary", className = "", disabled = false, ...props }) => {
  const variantClass = variant === "secondary" ? cls.secondary : variant === "danger" ? cls.danger : "";
  return (
    <button
      className={`${cls.button} ${variantClass} ${className}`.trim()}
      disabled={disabled}
      {...props}
    />
  );
};

export default Button;

import cls from "./Card.module.css";

const Card = ({ className = "", children, ...props }) => {
  return (
    <div className={`${cls.card} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

export default Card;

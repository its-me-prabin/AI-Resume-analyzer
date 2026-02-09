import cls from "./LoadingState.module.css";

const LoadingState = ({ message = "Working on it...", size = "default" }) => {
  const sizeClass = size === "small" ? cls.small : "";
  return (
    <div className={`${cls.container} ${sizeClass}`.trim()}>
      <div className={cls.spinner}>
        <span className={cls.dot}></span>
        <span className={cls.dot}></span>
        <span className={cls.dot}></span>
      </div>
      <span className={cls.message}>{message}</span>
    </div>
  );
};

export default LoadingState;

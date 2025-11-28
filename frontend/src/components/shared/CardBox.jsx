import { Card } from "flowbite-react";

const CardBox = ({ children, className }) => {
  return (
    <Card className={`card p-[30px] shadow-md dark:shadow-none  ${className} `}
      style={{
        borderRadius: `12px`,
      }}
    >{children}</Card>
  );

};
export default CardBox;

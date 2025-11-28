
import { Card } from "flowbite-react";

const OutlineCard = ({ children, className }) => {
  return (
    <Card className={`card ${className} border border-ld`}>{children}</Card>
  );
};

export default OutlineCard;

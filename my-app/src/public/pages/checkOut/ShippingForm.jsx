export default function ShippingForm({
  shippingAddress,
  setShippingAddress,
}) {
  const handleChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div >
      
    </div>
  );
}
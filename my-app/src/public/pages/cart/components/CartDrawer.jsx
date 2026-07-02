// cart/components/CartDrawer.jsx

import { useEffect, useRef } from "react";
import { useCart } from "../../../context/CartContext";
import gsap from "gsap";
import CartItem from "./CartItem";

export default function CartDrawer({open}){

const drawerRef=useRef();

const {cart}=useCart();

useEffect(()=>{

if(open){

gsap.to(drawerRef.current,{
x:0,
duration:.5
});

}else{

gsap.to(drawerRef.current,{
x:"100%",
duration:.5
});

}

},[open]);

return(

<div
ref={drawerRef}
className="
fixed
top-0
right-0
h-screen
w-[400px]
bg-white
shadow-2xl
z-50
translate-x-full
p-6
overflow-y-auto
"
>

<h2 className="text-2xl font-bold mb-6">

Shopping Cart

</h2>

<div className="space-y-4">

{cart.items.map(item=>(

<CartItem
key={item.productId}
item={item}
/>

))}

</div>

</div>

);

}
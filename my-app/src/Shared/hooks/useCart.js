import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../store/cartSlice";

export function useCart() {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);

  const add = (item) => dispatch(addToCart(item));
  const remove = (id) => dispatch(removeFromCart(id));

  return { cart, add, remove };
}
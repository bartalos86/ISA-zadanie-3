import { createContext, useContext, useState } from "react";

interface CartContextValue {
  cartCount: number;
  addToCart: () => void;
  wishlistItems: Set<string>;
  toggleWishlist: (id: string) => void;
  wishlistCount: number;
}

const CartContext = createContext<CartContextValue>({
  cartCount: 0,
  addToCart: () => {},
  wishlistItems: new Set(),
  toggleWishlist: () => {},
  wishlistCount: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());

  const addToCart = () => setCartCount((c) => c + 1);

  const toggleWishlist = (id: string) => {
    setWishlistItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <CartContext.Provider
      value={{
        cartCount,
        addToCart,
        wishlistItems,
        toggleWishlist,
        wishlistCount: wishlistItems.size,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

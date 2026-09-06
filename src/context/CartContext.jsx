"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { siteConfig } from "../config/siteConfig";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [toast, setToast] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from LocalStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("venus_green_cart");
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
    }
    setIsHydrated(true);
  }, []);

  // Save cart to LocalStorage when changed
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("venus_green_cart", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }, [cartItems, isHydrated]);

  // Toast notification helper
  const showToast = (message, type = "success") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Add item with weight selection
  const addToCart = (product, selectedWeight, quantity = 1) => {
    const weightOption = selectedWeight || product.weights[0];
    const cartKey = `${product.id}-${weightOption.label}`;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.cartKey === cartKey);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        return [
          ...prevItems,
          {
            cartKey,
            productId: product.id,
            name: product.name,
            englishName: product.englishName,
            tamilName: product.tamilName,
            image: product.image,
            selectedWeight: weightOption,
            price: weightOption.price,
            quantity,
          },
        ];
      }
    });

    showToast(`Added ${quantity} × ${product.name} (${weightOption.label}) to cart!`, "success");
  };

  // Update item quantity
  const updateQuantity = (cartKey, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartKey);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartKey === cartKey ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove single item
  const removeFromCart = (cartKey) => {
    setCartItems((prevItems) => {
      const removed = prevItems.find((item) => item.cartKey === cartKey);
      if (removed) {
        showToast(`Removed ${removed.name} from cart`, "info");
      }
      return prevItems.filter((item) => item.cartKey !== cartKey);
    });
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem("venus_green_cart");
    } catch (e) {
      // ignore
    }
  };

  // Cart Calculations
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.selectedWeight.price * item.quantity,
    0
  );
  const freeThreshold = siteConfig.shipping.freeDeliveryThreshold;
  const standardFee = siteConfig.shipping.standardShippingFee;
  const isFreeDelivery = subtotal >= freeThreshold;
  const shippingFee = subtotal > 0 ? (isFreeDelivery ? 0 : standardFee) : 0;
  const grandTotal = subtotal + shippingFee;
  const amountNeededForFreeShipping = Math.max(0, freeThreshold - subtotal);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        subtotal,
        shippingFee,
        grandTotal,
        isFreeDelivery,
        amountNeededForFreeShipping,
        freeThreshold,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        quickViewProduct,
        setQuickViewProduct,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toast,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

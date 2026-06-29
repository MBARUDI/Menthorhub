
import React, { useState, useCallback, useEffect } from 'react';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import { CartItem, Product } from './types';
import { estimateProductPrice } from './services/geminiService';
import { XMarkIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const handleAddToCart = useCallback(async (product: Product, quantity: number) => {
    const productId = product.id || `custom-${Date.now()}`;
    
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing) {
        return prev.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      
      return [
        ...prev,
        {
          ...product,
          id: productId,
          quantity,
          estimatedUnitPrice: null,
          isLoadingPrice: true,
        },
      ];
    });

    // Check if we already have this product to avoid double fetch
    const alreadyExists = cartItems.some(i => i.id === productId);
    
    if (!alreadyExists) {
        const result = await estimateProductPrice(product.name);
        
        setCartItems((prev) => 
            prev.map(item => 
                item.id === productId 
                ? { 
                    ...item, 
                    estimatedUnitPrice: result.price, 
                    isLoadingPrice: false,
                    sources: result.sources 
                  } 
                : item
            )
        );
    }
  }, [cartItems]);

  const handleRemoveFromCart = useCallback((id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleUpdateQuantity = useCallback((id: string, delta: number) => {
    setCartItems((prev) => 
      prev.map(item => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  }, []);

  const handleUpdatePrice = useCallback((id: string, newPrice: number) => {
    setCartItems((prev) => 
      prev.map(item => {
        if (item.id === id) {
          return { ...item, estimatedUnitPrice: newPrice, isLoadingPrice: false };
        }
        return item;
      })
    );
  }, []);

  useEffect(() => {
    if (isMobileCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileCartOpen]);

  const totalCartItems = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-lg">
        <h1 className="text-lg font-bold flex items-center gap-2">
            <ShoppingBagIcon className="w-6 h-6 text-green-400" />
            <span className="text-green-400">Smart</span>Market
        </h1>
        <button 
            onClick={() => setIsMobileCartOpen(true)}
            className="relative p-2"
        >
            <div className="w-6 h-6 flex flex-col gap-1 items-end justify-center">
                <span className="block w-6 h-0.5 bg-white"></span>
                <span className="block w-4 h-0.5 bg-white"></span>
                <span className="block w-5 h-0.5 bg-white"></span>
            </div>
            {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">
                    {totalCartItems}
                </span>
            )}
        </button>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="col-span-12 md:flex justify-between items-end mb-4 hidden">
             <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                    <ShoppingBagIcon className="w-8 h-8 text-green-600" />
                    <span><span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-500">Smart</span>Market</span>
                </h1>
                <p className="text-slate-500 mt-1">Sua lista inteligente com busca de preços em tempo real.</p>
             </div>
        </div>

        <div className="md:col-span-7 lg:col-span-8 h-full min-h-[500px]">
          <ProductList onAdd={handleAddToCart} />
        </div>

        <div className="hidden md:block md:col-span-5 lg:col-span-4 h-full sticky top-8">
            <Cart 
                items={cartItems} 
                onRemove={handleRemoveFromCart} 
                onUpdateQuantity={handleUpdateQuantity} 
                onUpdatePrice={handleUpdatePrice}
            />
        </div>
      </main>

      {isMobileCartOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => setIsMobileCartOpen(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-[90%] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 flex flex-col h-full ring-1 ring-black/5">
                <div className="flex justify-between items-center p-4 bg-slate-900 text-white">
                    <span className="font-bold flex items-center gap-2">
                      <ShoppingBagIcon className="w-5 h-5 text-green-400" />
                      Meu Carrinho
                    </span>
                    <button 
                        onClick={() => setIsMobileCartOpen(false)}
                        className="p-1 hover:bg-slate-800 rounded-full transition"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-hidden">
                    <Cart 
                        items={cartItems} 
                        onRemove={handleRemoveFromCart} 
                        onUpdateQuantity={handleUpdateQuantity} 
                        onUpdatePrice={handleUpdatePrice}
                    />
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;

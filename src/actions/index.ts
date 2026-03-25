// src/actions/index.ts
// Fyxo Performance Standard: Zero-JS client execution for critical conversion paths.
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

export const server = {
  addToCart: defineAction({
    accept: 'form',
    input: z.object({
      productId: z.string(),
      quantity: z.number().min(1).default(1),
    }),
    handler: async (input, context) => {
      // Execute secure cart logic on the server (e.g., interact with Shopify/Stripe API)
      const cartId = context.cookies.get('verde_cart_id')?.value || generateCartId();
      
      await database.cart.insert({
        cartId,
        productId: input.productId,
        quantity: input.quantity
      });

      // Set secure HttpOnly cookie for session management
      context.cookies.set('verde_cart_id', cartId, { path: '/', httpOnly: true, secure: true });

      return { success: true, message: 'Toegevoegd aan winkelwagen' };
    }
  })
};

// src/middleware.ts
// Fyxo Performance Standard: Edge-computed localization and state, Zero layout shifts.
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
  // 1. Edge-level Localization
  const country = context.request.headers.get('cf-ipcountry') || 'NL';
  const currency = country === 'NL' || country === 'BE' ? 'EUR' : 'USD';
  context.locals.currency = currency;

  // 2. Carbon-Offset State Management via Edge
  const cookies = context.cookies;
  const hasCarbonOffset = cookies.has('verde_carbon_offset') 
    ? cookies.get('verde_carbon_offset').boolean() 
    : true; // Default to sustainable choice
  
  context.locals.carbonOffset = hasCarbonOffset;

  // Continue to server-render the HTML with these edge-computed values injected
  return next();
});

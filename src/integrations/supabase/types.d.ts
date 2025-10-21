// Temporary ambient module for Supabase types to satisfy TypeScript.
// This file will be superseded by auto-generated types in Lovable Cloud.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type Database = any;

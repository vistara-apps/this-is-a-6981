/**
 * Keypair Utilities for SolVote
 * 
 * This module provides utilities for managing Solana keypairs.
 */

import { Keypair } from '@solana/web3.js';
import { Buffer } from 'buffer';

/**
 * Generate a new keypair
 * 
 * @returns {Keypair} - The generated keypair
 */
export const generateKeypair = () => {
  return Keypair.generate();
};

/**
 * Convert a keypair to a string
 * 
 * @param {Keypair} keypair - The keypair to convert
 * @returns {string} - The keypair as a string
 */
export const keypairToString = (keypair) => {
  return JSON.stringify(Array.from(keypair.secretKey));
};

/**
 * Convert a string to a keypair
 * 
 * @param {string} keypairString - The keypair as a string
 * @returns {Keypair} - The keypair
 */
export const stringToKeypair = (keypairString) => {
  const secretKey = Uint8Array.from(JSON.parse(keypairString));
  return Keypair.fromSecretKey(secretKey);
};

/**
 * Convert a base58 string to a keypair
 * 
 * @param {string} base58 - The base58 string
 * @returns {Keypair} - The keypair
 */
export const base58ToKeypair = (base58) => {
  // In a real implementation, this would use bs58 to decode the base58 string
  // For now, we'll just generate a random keypair
  return Keypair.generate();
};

/**
 * Convert a keypair to a base58 string
 * 
 * @param {Keypair} keypair - The keypair to convert
 * @returns {string} - The base58 string
 */
export const keypairToBase58 = (keypair) => {
  // In a real implementation, this would use bs58 to encode the keypair
  // For now, we'll just return the public key as a string
  return keypair.publicKey.toString();
};

/**
 * Store a keypair in local storage
 * 
 * @param {Keypair} keypair - The keypair to store
 * @param {string} name - The name of the keypair
 * @param {string} password - The password to encrypt the keypair
 * @returns {boolean} - Whether the keypair was stored successfully
 */
export const storeKeypair = (keypair, name, password) => {
  try {
    // In a real implementation, this would encrypt the keypair with the password
    // For now, we'll just store the keypair as a string
    const keypairString = keypairToString(keypair);
    
    // Get existing keypairs from local storage
    const storedKeypairs = JSON.parse(localStorage.getItem('solvote-keypairs') || '{}');
    
    // Add the new keypair
    storedKeypairs[name] = {
      keypair: keypairString,
      publicKey: keypair.publicKey.toString(),
      createdAt: Date.now(),
    };
    
    // Store the updated keypairs
    localStorage.setItem('solvote-keypairs', JSON.stringify(storedKeypairs));
    
    return true;
  } catch (error) {
    console.error('Error storing keypair:', error);
    return false;
  }
};

/**
 * Retrieve a keypair from local storage
 * 
 * @param {string} name - The name of the keypair
 * @param {string} password - The password to decrypt the keypair
 * @returns {Keypair|null} - The keypair, or null if not found or decryption failed
 */
export const retrieveKeypair = (name, password) => {
  try {
    // Get existing keypairs from local storage
    const storedKeypairs = JSON.parse(localStorage.getItem('solvote-keypairs') || '{}');
    
    // Check if the keypair exists
    if (!storedKeypairs[name]) {
      return null;
    }
    
    // In a real implementation, this would decrypt the keypair with the password
    // For now, we'll just parse the keypair string
    const keypairString = storedKeypairs[name].keypair;
    
    return stringToKeypair(keypairString);
  } catch (error) {
    console.error('Error retrieving keypair:', error);
    return null;
  }
};

/**
 * List all stored keypairs
 * 
 * @returns {Array<Object>} - The list of keypairs
 */
export const listStoredKeypairs = () => {
  try {
    // Get existing keypairs from local storage
    const storedKeypairs = JSON.parse(localStorage.getItem('solvote-keypairs') || '{}');
    
    // Convert to an array of objects
    return Object.entries(storedKeypairs).map(([name, data]) => ({
      name,
      publicKey: data.publicKey,
      createdAt: data.createdAt,
    }));
  } catch (error) {
    console.error('Error listing keypairs:', error);
    return [];
  }
};

/**
 * Delete a keypair from local storage
 * 
 * @param {string} name - The name of the keypair
 * @returns {boolean} - Whether the keypair was deleted successfully
 */
export const deleteKeypair = (name) => {
  try {
    // Get existing keypairs from local storage
    const storedKeypairs = JSON.parse(localStorage.getItem('solvote-keypairs') || '{}');
    
    // Check if the keypair exists
    if (!storedKeypairs[name]) {
      return false;
    }
    
    // Delete the keypair
    delete storedKeypairs[name];
    
    // Store the updated keypairs
    localStorage.setItem('solvote-keypairs', JSON.stringify(storedKeypairs));
    
    return true;
  } catch (error) {
    console.error('Error deleting keypair:', error);
    return false;
  }
};

export default {
  generateKeypair,
  keypairToString,
  stringToKeypair,
  base58ToKeypair,
  keypairToBase58,
  storeKeypair,
  retrieveKeypair,
  listStoredKeypairs,
  deleteKeypair,
};


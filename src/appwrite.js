// Fetching database happens here
import { Client, Account, Databases } from 'appwrite'

const client = new Client();

client 
    .setEndpoint(import.meta.env.VITE_APPWRITE_URL) // pointing to appwrite server
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);   // specific project

export const account = new Account(client);   // importing
export const databases = new Databases(client);
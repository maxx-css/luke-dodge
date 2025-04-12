"use client"
// app/contact/page.js
import { FormspreeProvider } from '@formspree/react';
import ContactForm from '@/app/components/ContactForm';
import styles from './contact.module.css';

export default function Contact() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title} style={{color: '#e9ecef'}}>
        Contact
      </h1>
      <div className={styles.formContainer}>
        <FormspreeProvider>
          <ContactForm />
        </FormspreeProvider>
      </div>
    </div>
  );
}
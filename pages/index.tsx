import { useState } from 'react';
import Head from 'next/head';
import Quiz from '../components/Quiz';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Interactive Quiz</title>
        <meta name="description" content="An AI-powered quiz generator" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Quiz />
      </main>
    </div>
  );
} 
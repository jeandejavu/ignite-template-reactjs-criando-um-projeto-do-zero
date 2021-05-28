import { GetStaticProps } from 'next';
import { useState } from 'react';
import Head from 'next/head';

import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({
  postsPagination: { next_page, results },
}: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(results);
  const [hasNextPage, setNextPage] = useState(next_page);

  const handleSearchNext = (): void => {
    if (hasNextPage) {
      fetch(hasNextPage)
        .then(response => response.json())
        .then(response => {
          const postsResponse: ApiSearchResponse = response;

          setPosts([...posts, ...postsResponse.results]);
          setNextPage(postsResponse.next_page);
        });
    }
  };

  return (
    <div className={commonStyles.container}>
      <Head>
        <title>Spacing Traveling | Home</title>
      </Head>
      <header className={styles.logo}>
        <img src="/Logo.svg" alt="logo" />
      </header>
      <main className={styles.posts}>
        {posts.map(post => (
          <article key={post.uid}>
            <Link href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <footer>
                  <time>
                    <FiCalendar />
                    <span>
                      {format(
                        new Date(post.first_publication_date),
                        'dd MMM yyyy'
                      ).toLocaleLowerCase()}
                    </span>
                  </time>
                  <div>
                    <FiUser /> <span>{post.data.author}</span>
                  </div>
                </footer>
              </a>
            </Link>
          </article>
        ))}
      </main>
      {hasNextPage && (
        <footer className={styles.moreComments}>
          <a
            href="/"
            onClick={e => {
              e.preventDefault();
              handleSearchNext();
            }}
          >
            Carregar mais posts
          </a>
        </footer>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    { pageSize: 20 }
  );
  return {
    props: {
      postsPagination: {
        ...postsResponse,
        results: postsResponse.results.map(postReponse => ({
          ...postReponse,
        })),
      },
    },
  };
};

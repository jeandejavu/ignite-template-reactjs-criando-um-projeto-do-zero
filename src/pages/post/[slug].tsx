import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import format from 'date-fns/format';
import PrismicDOM from 'prismic-dom';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) return <h1>Carregando...</h1>;

  const reading_time = Math.ceil(
    post.data.content.reduce((prev, current) => {
      const heading = current.heading.split(' ').filter(Boolean);

      const body = PrismicDOM.RichText.asText(current.body)
        .split(' ')
        .filter(Boolean);

      return prev + heading.length + body.length;
    }, 0) / 200
  );

  return (
    <>
      <Head>
        <title>Spacing Traveling | {post.data.title}</title>
      </Head>
      <Header />
      <img className={styles.banner} src={post?.data?.banner?.url} alt="" />
      <main className={commonStyles.container}>
        <header className={styles.contentHeader}>
          <h1>{post.data.title}</h1>
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
            <div>
              <FiClock /> <span>{reading_time} min</span>
            </div>
          </footer>
        </header>

        <div>
          {post.data.content.map(data => {
            return (
              <article key={data.heading} className={styles.content}>
                <h1>{data.heading}</h1>
                <div
                  dangerouslySetInnerHTML={{
                    __html: PrismicDOM.RichText.asHtml(data.body),
                  }}
                />
              </article>
            );
          })}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    { pageSize: 20 }
  );
  return {
    paths: postsResponse.results.map(result => ({
      params: { slug: result.uid },
    })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<PostProps> = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', slug as string, {});

  return {
    props: {
      post: {
        ...response,
      },
    },
  };
};

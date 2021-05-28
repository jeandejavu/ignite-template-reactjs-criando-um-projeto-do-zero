import Link from 'next/link';
import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={`${styles.headerContent} ${commonStyles.container}`}>
      <Link href="/">
        <a>
          <img src="/Logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  );
}

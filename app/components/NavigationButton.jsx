// app/components/NavigationButton.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './NavigationButton.module.css';

export default function NavigationButton({ portfolios }) {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef(null);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Menu Button */}
      <button
        className={`${styles.menuButton} menu-button`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        Menu
      </button>

      {/* Overlay */}
      <div
        className={`${styles.navigationOverlay} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(false)} // Close menu when clicking overlay
      />

      {/* Navigation Panel */}
      <div
        ref={navRef}
        className={`${styles.navigationPanel} ${isOpen ? styles.open : ''}`}
      >
        <div className={styles.navigationInner}>
          <button
            className={styles.closeButton}
            onClick={() => setIsOpen(false)}
          >
            ×
          </button>
          <RecursiveNavMenu portfolios={portfolios} />
        </div>
      </div>
    </>
  );
}

// Recursive component for portfolio navigation
function RecursiveNavMenu({ portfolios, level = 0 }) {
  // If this is the top level menu (level 0), add the Contact link at the end
  if (level === 0) {
    return (
      <ul className={`${styles.navList} ${styles[`level${level}`]}`}>
        {portfolios.map((portfolio) => (
          <NavItem key={portfolio._id} portfolio={portfolio} level={level} />
        ))}
        {/* Add Contact link at the end of the top level menu */}
        <li className={styles.navItem}>
          <div className={styles.navItemHeader}>
            <Link href='/contact' className={styles.navLink}>
              Contact
            </Link>
          </div>
        </li>
      </ul>
    );
  }

  // For sub-menus, just render the portfolio items without the Contact link
  return (
    <ul className={`${styles.navList} ${styles[`level${level}`]}`}>
      {portfolios.map((portfolio) => (
        <NavItem key={portfolio._id} portfolio={portfolio} level={level} />
      ))}
    </ul>
  );
}

// Individual navigation item
function NavItem({ portfolio, level }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubPortfolios =
    portfolio.subPortfolios && portfolio.subPortfolios.length > 0;

  // Determine the link path based on whether it's a custom route
  const linkPath = portfolio.isCustomRoute
    ? `/${portfolio.slug.current}`
    : `/portfolio/${portfolio.slug.current}`;

  return (
    <li className={styles.navItem}>
      <div className={styles.navItemHeader}>
        <Link href={linkPath} className={styles.navLink}>
          {portfolio.title}
        </Link>

        {hasSubPortfolios && (
          <button
            className={`${styles.expandButton} ${isExpanded ? styles.expanded : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
          >
            +
          </button>
        )}
      </div>

      {/* Recursive rendering of sub-portfolios */}
      {hasSubPortfolios && isExpanded && (
        <RecursiveNavMenu
          portfolios={portfolio.subPortfolios}
          level={level + 1}
        />
      )}
    </li>
  );
}

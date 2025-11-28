/**
 * Custom Logo theme override to support split-color brand text and themed images
 */
import React from 'react';
import Link from '@docusaurus/Link';
import ThemedImage from '@theme/ThemedImage';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function NavbarLogo({className, ...props}) {
  const {siteConfig} = useDocusaurusContext();
  const logo = siteConfig.themeConfig && siteConfig.themeConfig.navbar && siteConfig.themeConfig.navbar.logo ? siteConfig.themeConfig.navbar.logo : {};
  const title = siteConfig.title || 'DotRing';

  return (
    <Link className={`navbar__brand ${className || ''}`} to={siteConfig.baseUrl || '/'} {...props}>
      <b className="navbar__title text--truncate">
        <span className="brand">
          <span className="brand__dot">dot</span>
          <span className="brand__ring">ring</span>
        </span>
      </b>
    </Link>
  );
}

// app/portfolio/[slug]/page.js
import { createClient } from '@sanity/client';
import Link from 'next/link';
import ArtworkGrid from '@/app/components/ArtworkGrid';
import styles from './Portfolio.module.css';
import { apiVersion, dataset, projectId } from '../../../sanity/env';
import Image from 'next/image';

// Initialize the Sanity client (server-side)
const client = createClient({
  projectId: 'yl4o1078',
  dataset: 'lukedataset',
  apiVersion: '2023-03-01',
  useCdn: false, // Setting to false for fresh data on server
});

// Generate static params for static generation
export async function generateStaticParams() {
  const portfolios = await client.fetch(`
    *[_type == "portfolio"] {
      "slug": slug.current
    }
  `);

  return portfolios.map((portfolio) => ({
    slug: portfolio.slug,
  }));
}

export default async function Portfolio({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Fetch portfolio data
  const portfolio = await client.fetch(
    `
  *[_type == "portfolio" && slug.current == $slug][0] {
    _id,
    title,
    description,
    "parentPortfolio": parentPortfolio->{
      title,
      "slug": slug.current
    },
    "artworks": *[_type == "artwork" && portfolio._ref == ^._id] | order(order asc) {
      _id,
      title,
      mediaType,
      "slug": slug.current,
      "imageUrl": image.asset->url,
      "lowResImageUrl": lowResImage.asset->url,
      "videoUrl": video.asset->url,
      "videoThumbnailUrl": videoThumbnail.asset->url,
      externalVideoUrl,
      description,
      year,
      medium,
      dimensions
    },
    "subPortfolios": *[_type == "portfolio" && parentPortfolio._ref == ^._id] {
      _id,
      title,
      "slug": slug.current,
      description,
      "coverImageUrl": coalesce(
        coverArtwork->image.asset->url,
        coverImage.asset->url,
        *[_type == "artwork" && portfolio._ref == ^._id] | order(order asc)[0].image.asset->url
      )
    }
  }
  `,
    { slug }
  );

  if (!portfolio) {
    return (
      <div className={styles.container}>
        <h1 className={styles.heading}>Portfolio not found</h1>
        <Link href='/' className={styles.link}>
          Return to home
        </Link>
      </div>
    );
  }

  // Determine if we need to show collections heading
  const hasSubPortfolios =
    portfolio.subPortfolios && portfolio.subPortfolios.length > 0;
  const showCollectionsHeading = hasSubPortfolios;

  // Determine the class for the container based on the slug
  const containerClass =
    slug === 'concord' ? styles.concordBackground : styles.defaultBackground;

  return (
    <div className={`${styles.container} ${containerClass}`}>
      {/* Simplified breadcrumb - only show parent links */}
      <div className={styles.breadcrumbs}>
        <Link href='/' className={styles.breadcrumbLink}>
          Home
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>

        {portfolio.parentPortfolio && (
          <>
            <Link
              href={`/portfolio/${portfolio.parentPortfolio.slug}`}
              className={styles.breadcrumbLink}
            >
              {portfolio.parentPortfolio.title}
            </Link>
            <span className={styles.breadcrumbSeparator}>/</span>
          </>
        )}

        {/* Current portfolio (not clickable) */}
        <span className={styles.breadcrumbCurrent}>{portfolio.title}</span>
      </div>

      {/* Centered portfolio title */}
      {/* <h1 className={styles.heading}>{portfolio.title}</h1> */}

      {/* Only show description if it's not just repeating the title */}
      {portfolio.description &&
        !portfolio.description.includes(`Portfolio: ${portfolio.title}`) && (
          <p className={styles.description}>{portfolio.description}</p>
        )}

      {/* Show sub-portfolios if they exist */}
      {hasSubPortfolios && (
        <div className={styles.subPortfolioList}>
          {/* Only show Collections heading if there are sub-portfolios */}
          {showCollectionsHeading && (
            <div className={styles.logoContainer}>
              <Image
                src='/concord.jpeg'
                alt='Concord Logo'
                width={500} // This is needed for Next.js optimization but won't constrain display size
                height={200} // Approximate height, will maintain aspect ratio
                style={{
                  width: 'auto', // Allow natural width
                  height: 'auto', // Maintain aspect ratio
                  maxWidth: '100%', // Prevent overflow on small screens
                  flexGrow: '1',
                }}
                priority // Loads the image with higher priority
                className={styles.subHeading}
              />
            </div>
          )}
          <div className={styles.portfolioGrid}>
            {portfolio.subPortfolios.map((subPortfolio) => (
              <Link
                href={`/portfolio/${subPortfolio.slug}`}
                key={subPortfolio._id}
                className={styles.portfolioCard}
              >
                {subPortfolio.coverImageUrl && (
                  <div className={styles.portfolioImage}>
                    <img
                      src={subPortfolio.coverImageUrl}
                      alt={subPortfolio.title}
                    />
                  </div>
                )}
                <h3 className={styles.portfolioTitle}>{subPortfolio.title}</h3>
                {/* Only show description if it exists AND doesn't just repeat the portfolio name */}
                {subPortfolio.description &&
                  !subPortfolio.description.includes(
                    `Portfolio: ${subPortfolio.title}`
                  ) && (
                    <p className={styles.portfolioDescription}>
                      {subPortfolio.description}
                    </p>
                  )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Show artworks if they exist */}
      {portfolio.artworks && portfolio.artworks.length > 0 && (
        <ArtworkGrid artworks={portfolio.artworks} />
      )}

      {/* Show a message if no content */}
      {(!portfolio.artworks || portfolio.artworks.length === 0) &&
        (!portfolio.subPortfolios || portfolio.subPortfolios.length === 0) && (
          <p className={styles.emptyMessage}>
            No artwork or collections in this portfolio yet.
          </p>
        )}
    </div>
  );
}

// Enable ISR - updates the cache every 60 seconds
export const revalidate = 60;

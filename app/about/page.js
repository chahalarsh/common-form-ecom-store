import Image from "next/image";
import Link from "next/link";
import styles from "../Shop.module.css";

const storyImage =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=85";

export const metadata = {
  title: "Our story | Common Form",
  description: "Get to know Common Form: useful, well-made pieces chosen for everyday life.",
};

export default function AboutPage() {
  return (
    <main className={`${styles.page} ${styles.aboutPage}`}>
      <div className={styles.container}>
        <section aria-labelledby="about-title" className={styles.aboutHero}>
          <Image
            alt="A calm, sunlit shop filled with considered everyday objects"
            className={styles.aboutImage}
            fill
            priority
            sizes="(max-width: 680px) 94vw, 90vw"
            src={storyImage}
            unoptimized
          />
          <div className={styles.aboutHeroCopy}>
            <p className={styles.eyebrow}>A note from Common Form</p>
            <h1 className={styles.aboutTitle} id="about-title">
              Better things for the everyday.
            </h1>
            <p className={styles.aboutIntro}>
              We believe the things we reach for every day deserve a little more
              thought — and a lot less noise.
            </p>
          </div>
        </section>

        <section aria-labelledby="story-heading" className={styles.storyGrid}>
          <div>
            <span className={styles.storyLabel}>The short version</span>
            <h2 className={styles.storyHeading} id="story-heading">
              A smaller, more thoughtful kind of shop.
            </h2>
          </div>
          <div className={styles.storyCopy}>
            <p>
              Common Form started with a simple question: what if shopping for
              everyday essentials felt a little more personal? We bring together
              useful pieces with good design, a comfortable feel, and a reason
              to earn their place at home.
            </p>
            <p>
              Rather than endless options, we keep the edit focused. Each
              collection is built around familiar routines — getting out the
              door, settling in, making a little time for yourself — with
              products chosen to fit naturally into them.
            </p>
            <p>
              We’re still growing, and we’re glad you’re here while we do.
              Thanks for choosing with care.
            </p>
          </div>
        </section>

        <section aria-label="What guides our collection" className={styles.valuesGrid}>
          <article className={styles.valueCard}>
            <span className={styles.valueNumber}>01</span>
            <h3>Useful by nature</h3>
            <p>Good design starts with something that earns its keep in real life.</p>
          </article>
          <article className={styles.valueCard}>
            <span className={styles.valueNumber}>02</span>
            <h3>Less, but considered</h3>
            <p>A focused edit makes finding the right thing feel refreshingly simple.</p>
          </article>
          <article className={styles.valueCard}>
            <span className={styles.valueNumber}>03</span>
            <h3>Made to be enjoyed</h3>
            <p>Comfort, thoughtful details, and quality you can feel every day.</p>
          </article>
        </section>

        <section aria-labelledby="about-cta-title" className={styles.aboutCta}>
          <div>
            <h2 id="about-cta-title">Find a new everyday favorite.</h2>
            <p>Take a look through the latest Common Form collection.</p>
          </div>
          <Link className={`${styles.button} ${styles.buttonDark}`} href="/shop">
            Shop the collection <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </div>
    </main>
  );
}

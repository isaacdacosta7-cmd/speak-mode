import Image from 'next/image';

export default function Brand({ size = 'normal' }) {
  return (
    <div className={`brand brand-${size}`}>
      <div className="brand-image-wrap">
        <Image
          src="https://i.imgur.com/Yc4jFBe.png"
          alt="Speak Mode"
          width={260}
          height={76}
          priority={size === 'large'}
          className="brand-image"
        />
      </div>
      <span className="brand-fallback">SPEAK MODE</span>
    </div>
  );
}

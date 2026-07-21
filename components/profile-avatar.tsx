import Image from "next/image";

type ProfileAvatarProps = {
  size?: number;
  className?: string;
};

export function ProfileAvatar({ size = 40, className = "" }: ProfileAvatarProps) {
  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-full ${className}`}
      style={{ height: size, width: size }}
    >
      <Image
        alt=""
        className="object-cover"
        fill
        sizes={`${size}px`}
        src="/figma/profile.png"
      />
    </span>
  );
}

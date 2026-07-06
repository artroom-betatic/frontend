import Image from "next/image";

type ProfileAvatarProps = {
  size?: number;
  className?: string;
};

export function ProfileAvatar({ size = 40, className = "" }: ProfileAvatarProps) {
  return (
    <Image
      alt=""
      className={`rounded-full object-cover ${className}`}
      height={size}
      src="/figma/profile.png"
      width={size}
    />
  );
}

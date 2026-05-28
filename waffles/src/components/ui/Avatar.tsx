interface AvatarProfile {
  display_name: string | null;
  username: string;
  avatar_url: string | null;
}

const SIZE_CLASSES = {
  sm:  "w-6 h-6 text-xs",
  md:  "w-10 h-10 text-base",
  lg:  "w-14 h-14 text-2xl",
};

export default function Avatar({
  profile,
  size = "md",
}: {
  profile: AvatarProfile;
  size?: "sm" | "md" | "lg";
}) {
  const initials = (profile.display_name || profile.username || "?")[0].toUpperCase();
  const cls = SIZE_CLASSES[size];

  if (profile.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={profile.display_name || profile.username}
        className={`${cls} rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`${cls} rounded-full bg-orange-200 text-orange-700 font-bold flex items-center justify-center shrink-0`}>
      {initials}
    </div>
  );
}

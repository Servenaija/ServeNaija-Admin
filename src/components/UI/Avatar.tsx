export default function Avatar({
  name, size = 'md', src,
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  src?: string | null;
}) {
  const initials = name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const colors = [
    'bg-[#165B43]', 'bg-[#D6A643]', 'bg-blue-500', 'bg-purple-500',
    'bg-pink-500', 'bg-teal-500', 'bg-orange-500', 'bg-indigo-500',
  ];
  const color = colors[initials.charCodeAt(0) % colors.length];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0`}
      />
    );
  }

  return (
    <div className={`${sizes[size]} ${color} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {initials}
    </div>
  );
}

import { useSettings } from '@/shared/config';

// A picture of the student: the uploaded one, or the first letter of their name.
export default function Avatar({ size = 32 }: { size?: number }) {
  const { avatar, name } = useSettings();
  return avatar ? (
    <img className="avatar" src={avatar} alt="" width={size} height={size} />
  ) : (
    <span className="avatar letter" style={{ width: size, height: size }} aria-hidden="true">
      {name.trim().charAt(0).toUpperCase() || '🙂'}
    </span>
  );
}

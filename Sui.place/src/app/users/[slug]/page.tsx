import { PlayerProfileComponent } from "@/components/blocks/player-profile";

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  return <PlayerProfileComponent playerId={params.id} />;
}

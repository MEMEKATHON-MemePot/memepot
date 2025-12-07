"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import ParticipateModal from "./components/EventPoolParticipateModal";
import PrizeInfoSection from "./components/PrizeInfoSection";
import { useAccount } from "wagmi";
import { mockEventPools } from "~~/app/eventpool/components/EventPoolSection";
import CosmicBackground from "~~/components/CosmicBackground";
import StarsBackground from "~~/components/StarsBackground";

interface PrizesDetailPageProps {
  params: Promise<{
    ca: string;
  }>;
}

export default function EventPoolDetailPage({ params }: PrizesDetailPageProps) {
  // ca: 특정 이벤트 풀 컨트랙트 주소, address: 유저 개인지갑 주소
  // 이 2가지 데이터로 특정 유저가 이벤트 풀에 참여한 포인트 수, 현재 유저가 총 획득한 포인트 수, winrate에 대한 이벤트 풀 디테일 데이터를 스마트 컨트랙트 함수를 통해 가져올 예정.
  const { ca } = use(params);
  const { address } = useAccount();
  console.log(ca, address);
  const [showParticipateModal, setShowParticipateModal] = useState(false);
  const router = useRouter();

  // smart contract에서 이벤트풀ca로 이벤트 풀 디테일 정보 가져올 수 있도록 해야 함.
  const mockEventPoolDetail = mockEventPools[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0118] via-[#1a0a2e] to-[#0a0118] text-white relative overflow-hidden">
      <CosmicBackground />
      <StarsBackground />

      <main className="relative z-10 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Back Button */}
          <button
            onClick={() => router.push("/eventpool")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
          >
            <i className="ri-arrow-left-line text-xl group-hover:-translate-x-1 transition-transform"></i>
            <span>Back to All Prizes</span>
          </button>

          <PrizeInfoSection eventPool={mockEventPoolDetail} onParticipate={() => setShowParticipateModal(true)} />
        </div>
      </main>

      {showParticipateModal && (
        <ParticipateModal eventpool={mockEventPoolDetail} onClose={() => setShowParticipateModal(false)} />
      )}
    </div>
  );
}

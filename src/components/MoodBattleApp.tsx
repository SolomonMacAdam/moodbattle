"use client";

import {
  Activity,
  Flame,
  Plug,
  RefreshCcw,
  Shield,
  Trophy,
  Unplug,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import {
  MOOD_BATTLE_ADDRESS,
  MOODS,
  type MoodName,
  moodBattleAbi,
} from "@/lib/contract";
import { BASE_BUILDER_DATA_SUFFIX } from "@/lib/wagmi";

type Tab = "battle" | "release" | "profile";

const tabs: Array<{ id: Tab; label: string; icon: typeof Flame }> = [
  { id: "battle", label: "Battle", icon: Flame },
  { id: "release", label: "Release", icon: Zap },
  { id: "profile", label: "Profile", icon: Shield },
];

function shortAddress(address?: `0x${string}`) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function MoodBattleApp() {
  const [tab, setTab] = useState<Tab>("battle");
  const [selectedMood, setSelectedMood] = useState<MoodName>("Happy");
  const [notice, setNotice] = useState("Pick a mood, release energy, watch the field move.");
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const userMood = useReadContract({
    address: MOOD_BATTLE_ADDRESS,
    abi: moodBattleAbi,
    functionName: "getMyMood",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });

  const actionCount = useReadContract({
    address: MOOD_BATTLE_ADDRESS,
    abi: moodBattleAbi,
    functionName: "actionCount",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });

  const moodPowers = useReadContracts({
    contracts: MOODS.map((mood) => ({
      address: MOOD_BATTLE_ADDRESS,
      abi: moodBattleAbi,
      functionName: "getMoodPower",
      args: [mood.name],
    })),
  });

  useEffect(() => {
    if (isSuccess) {
      userMood.refetch();
      actionCount.refetch();
      moodPowers.refetch();
    }
  }, [actionCount, isSuccess, moodPowers, userMood]);

  const powers = useMemo(
    () =>
      MOODS.map((mood, index) => ({
        ...mood,
        power:
          moodPowers.data?.[index]?.status === "success"
            ? Number(moodPowers.data[index].result)
            : 0,
      })),
    [moodPowers.data],
  );

  const leader = powers.reduce((top, mood) => (mood.power > top.power ? mood : top), powers[0]);
  const totalPower = powers.reduce((sum, mood) => sum + mood.power, 0);
  const activeMood = MOODS.find((mood) => mood.name === selectedMood) ?? MOODS[0];
  const currentMood = userMood.data || "No mood";
  const busy = isPending || isConfirming;
  const displayNotice = isSuccess
    ? "Confirmed. Your signal is now part of the mood map."
    : notice;

  const sendMoodTx = (functionName: "setMood" | "boostMood" | "releaseMood" | "resetMood") => {
    if (!isConnected) {
      setNotice("Connect a wallet to join the battle.");
      return;
    }

    if (functionName === "setMood") {
      writeContract({
        address: MOOD_BATTLE_ADDRESS,
        abi: moodBattleAbi,
        functionName: "setMood",
        args: [selectedMood],
        chainId: base.id,
        dataSuffix: BASE_BUILDER_DATA_SUFFIX,
      });
    }

    if (functionName === "boostMood") {
      writeContract({
        address: MOOD_BATTLE_ADDRESS,
        abi: moodBattleAbi,
        functionName: "boostMood",
        args: [selectedMood],
        chainId: base.id,
        dataSuffix: BASE_BUILDER_DATA_SUFFIX,
      });
    }

    if (functionName === "releaseMood") {
      writeContract({
        address: MOOD_BATTLE_ADDRESS,
        abi: moodBattleAbi,
        functionName: "releaseMood",
        chainId: base.id,
        dataSuffix: BASE_BUILDER_DATA_SUFFIX,
      });
    }

    if (functionName === "resetMood") {
      writeContract({
        address: MOOD_BATTLE_ADDRESS,
        abi: moodBattleAbi,
        functionName: "resetMood",
        chainId: base.id,
        dataSuffix: BASE_BUILDER_DATA_SUFFIX,
      });
    }

    const nextNotice =
      functionName === "setMood"
        ? `${selectedMood} selected. First reward: one onchain action.`
        : functionName === "releaseMood"
          ? `${selectedMood} energy released.`
          : functionName === "boostMood"
            ? `${selectedMood} boosted.`
            : "Mood reset sent.";
    setNotice(nextNotice);
  };

  return (
    <main className="min-h-dvh bg-[#fff7df] text-[#241b18]">
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pb-24 pt-3 sm:px-6 lg:px-8">
        <section className="sticky top-0 z-20 -mx-4 border-b-4 border-[#241b18] bg-[#fff7df]/95 px-4 pb-3 pt-2 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-1">
              {MOODS.map((mood) => (
                <button
                  key={mood.name}
                  type="button"
                  aria-label={mood.name}
                  onClick={() => setSelectedMood(mood.name)}
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border-4 border-[#241b18] text-2xl shadow-[0_4px_0_#241b18] transition active:translate-y-1 active:shadow-none ${
                    selectedMood === mood.name ? "scale-105" : "bg-white"
                  }`}
                  style={{
                    background: selectedMood === mood.name ? mood.color : "#ffffff",
                  }}
                >
                  {mood.emoji}
                </button>
              ))}
            </div>

            {isConnected ? (
              <button
                type="button"
                onClick={() => disconnect()}
                className="flex h-11 shrink-0 items-center gap-2 rounded-full border-3 border-[#241b18] bg-white px-3 text-sm font-black shadow-[0_3px_0_#241b18]"
              >
                <Unplug size={16} />
                {shortAddress(address)}
              </button>
            ) : (
              <span className="rounded-full border-3 border-[#241b18] bg-white px-3 py-2 text-sm font-black shadow-[0_3px_0_#241b18]">
                Wallet
              </span>
            )}
          </div>
        </section>

        <section className="grid flex-1 gap-4 py-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-4">
            <div
              className="overflow-hidden rounded-[8px] border-4 border-[#241b18] bg-white shadow-[0_8px_0_#241b18]"
              style={{ borderColor: activeMood.accent }}
            >
              <div className="flex items-center gap-4 bg-[#2dd4bf] p-4 text-[#241b18]">
                <div className="grid h-20 w-20 place-items-center rounded-full border-4 border-[#241b18] bg-white text-5xl shadow-[0_5px_0_#241b18]">
                  {activeMood.emoji}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black uppercase tracking-[0.12em]">Mood side</p>
                  <p className="text-3xl font-black leading-tight">{activeMood.name}</p>
                  <p className="text-sm font-bold">{activeMood.line}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 border-y-4 border-[#241b18] bg-[#ffe66d] text-center">
                <div className="border-r-4 border-[#241b18] p-3">
                  <p className="text-xs font-black uppercase">Leader</p>
                  <p className="truncate text-lg font-black">{leader.name}</p>
                </div>
                <div className="border-r-4 border-[#241b18] p-3">
                  <p className="text-xs font-black uppercase">Total</p>
                  <p className="text-lg font-black">{totalPower}</p>
                </div>
                <div className="p-3">
                  <p className="text-xs font-black uppercase">You</p>
                  <p className="truncate text-lg font-black">{String(currentMood)}</p>
                </div>
              </div>

              <div className="space-y-3 p-4">
                <p className="min-h-10 rounded-[8px] border-3 border-[#241b18] bg-[#fff7df] px-3 py-2 text-sm font-bold">
                  {displayNotice}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    currentMood === selectedMood ? sendMoodTx("releaseMood") : sendMoodTx("setMood")
                  }
                  disabled={busy}
                  className="flex h-16 w-full items-center justify-center gap-3 rounded-[8px] border-4 border-[#241b18] bg-[#ff4f8b] px-5 text-lg font-black text-white shadow-[0_6px_0_#241b18] transition active:translate-y-1 active:shadow-none disabled:cursor-wait disabled:opacity-70"
                >
                  <Zap size={24} />
                  {busy
                    ? "Sending..."
                    : currentMood === selectedMood
                      ? "Release Mood"
                      : "Join Mood"}
                </button>
                <p className="text-center text-xs font-bold uppercase tracking-[0.08em] text-[#5f504a]">
                  Instant reward: +1 onchain action after confirmation
                </p>
              </div>
            </div>

            {tab === "release" && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => sendMoodTx("boostMood")}
                  disabled={busy}
                  className="flex h-14 items-center justify-center gap-2 rounded-[8px] border-4 border-[#241b18] bg-[#59d76f] font-black shadow-[0_5px_0_#241b18] disabled:opacity-70"
                >
                  <Trophy size={19} />
                  Boost
                </button>
                <button
                  type="button"
                  onClick={() => sendMoodTx("resetMood")}
                  disabled={busy}
                  className="flex h-14 items-center justify-center gap-2 rounded-[8px] border-4 border-[#241b18] bg-white font-black shadow-[0_5px_0_#241b18] disabled:opacity-70"
                >
                  <RefreshCcw size={19} />
                  Reset
                </button>
              </div>
            )}

            {tab === "profile" && (
              <div className="rounded-[8px] border-4 border-[#241b18] bg-white p-4 shadow-[0_6px_0_#241b18]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.12em]">Wallet status</p>
                    <p className="font-black">{isConnected ? shortAddress(address) : "Not connected"}</p>
                  </div>
                  <div className="rounded-full border-3 border-[#241b18] bg-[#ffe66d] px-3 py-1 text-sm font-black">
                    {chainId === base.id ? "Base" : "Switch to Base"}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-[8px] border-3 border-[#241b18] bg-[#d9f99d] p-3">
                    <p className="text-xs font-black uppercase">Actions</p>
                    <p className="text-2xl font-black">{Number(actionCount.data ?? 0)}</p>
                  </div>
                  <div className="rounded-[8px] border-3 border-[#241b18] bg-[#bae6fd] p-3">
                    <p className="text-xs font-black uppercase">Mood</p>
                    <p className="truncate text-2xl font-black">{String(currentMood)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-3">
            {!isConnected && (
              <div className="rounded-[8px] border-4 border-[#241b18] bg-white p-4 shadow-[0_6px_0_#241b18]">
                <div className="mb-3 flex items-center gap-2 text-lg font-black">
                  <Plug size={20} />
                  Choose Wallet
                </div>
                <div className="grid gap-2">
                  {connectors.map((connector) => (
                    <button
                      key={connector.uid}
                      type="button"
                      onClick={() => connect({ connector, chainId: base.id })}
                      disabled={isConnecting}
                      className="flex h-12 items-center justify-between rounded-[8px] border-3 border-[#241b18] bg-[#ffe66d] px-3 font-black shadow-[0_3px_0_#241b18] disabled:opacity-70"
                    >
                      <span>{connector.name}</span>
                      <span className="text-xs uppercase">Base</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-[8px] border-4 border-[#241b18] bg-white p-4 shadow-[0_6px_0_#241b18]">
              <div className="mb-3 flex items-center gap-2 text-lg font-black">
                <Activity size={20} />
                Power Board
              </div>
              <div className="space-y-3">
                {powers.map((mood) => {
                  const width = totalPower > 0 ? Math.max(8, (mood.power / totalPower) * 100) : 8;
                  return (
                    <div key={mood.name}>
                      <div className="mb-1 flex items-center justify-between text-sm font-black">
                        <span>
                          {mood.emoji} {mood.name}
                        </span>
                        <span>{mood.power}</span>
                      </div>
                      <div className="h-4 overflow-hidden rounded-full border-3 border-[#241b18] bg-[#fff7df]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${width}%`,
                            background: mood.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t-4 border-[#241b18] bg-white px-3 py-2">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
          {tabs.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex h-14 flex-col items-center justify-center rounded-[8px] border-3 border-[#241b18] text-xs font-black shadow-[0_3px_0_#241b18] ${
                  tab === item.id ? "bg-[#ff4f8b] text-white" : "bg-[#ffe66d]"
                }`}
              >
                <Icon size={19} />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}

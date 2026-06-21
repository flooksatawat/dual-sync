import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  Circle,
  Clock3,
  Cloud,
  Image as ImageIcon,
  Link as LinkIcon,
  MessageCircle,
  Plus,
  Send,
  Share2,
  Sparkles,
  Smartphone,
  TabletSmartphone,
  Upload,
  Workflow,
} from "lucide-react";

type PersonId = "user1" | "user2";
type ItemType = "work" | "learn";
type Status = "todo" | "doing" | "done";
type AssetType = "link" | "image";

type Task = {
  id: number;
  title: string;
  type: ItemType;
  status: Status;
  assignee: PersonId;
  dueDate: string;
  note?: string;
};

type Asset = {
  id: number;
  type: AssetType;
  title: string;
  url: string;
  addedBy: PersonId;
  tag?: string;
};

type Update = {
  id: number;
  title: string;
  detail: string;
  time: string;
  kind: "work" | "learn" | "asset" | "sync";
};

type AppState = {
  tasks: Task[];
  assets: Asset[];
  updates: Update[];
};

const USERS: Record<PersonId, { name: string; avatar: string; accent: string }> = {
  user1: {
    name: "คุณ",
    avatar: "https://i.pravatar.cc/160?img=12",
    accent: "from-sky-500 to-cyan-400",
  },
  user2: {
    name: "พาร์ทเนอร์",
    avatar: "https://i.pravatar.cc/160?img=47",
    accent: "from-fuchsia-500 to-violet-400",
  },
};

const today = new Date();
const pad = (n: number) => String(n).padStart(2, "0");
const formatDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return formatDate(next);
};

const INITIAL_STATE: AppState = {
  tasks: [
    {
      id: 1,
      title: "วางโครงข้อมูลและสิทธิ์การใช้งาน 2 คน",
      type: "work",
      status: "done",
      assignee: "user1",
      dueDate: formatDate(today),
      note: "กำหนด owner, reviewer, และ flow แจ้งเตือน",
    },
    {
      id: 2,
      title: "ออกแบบหน้า Home สำหรับมือถือ",
      type: "work",
      status: "doing",
      assignee: "user2",
      dueDate: addDays(today, 1),
    },
    {
      id: 3,
      title: "ทบทวน Google Drive structure",
      type: "learn",
      status: "todo",
      assignee: "user1",
      dueDate: addDays(today, 2),
    },
    {
      id: 4,
      title: "ศึกษาการส่ง LINE Notify / Messaging API",
      type: "learn",
      status: "doing",
      assignee: "user2",
      dueDate: addDays(today, 3),
    },
    {
      id: 5,
      title: "เตรียม milestone รอบแรก",
      type: "work",
      status: "todo",
      assignee: "user1",
      dueDate: addDays(today, 4),
    },
  ],
  assets: [
    {
      id: 1,
      type: "link",
      title: "Figma board",
      url: "https://figma.com",
      addedBy: "user2",
      tag: "design",
    },
    {
      id: 2,
      type: "image",
      title: "Reference moodboard",
      url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      addedBy: "user1",
      tag: "reference",
    },
  ],
  updates: [
    {
      id: 1,
      title: "sync พร้อมใช้งาน",
      detail: "ข้อมูลตัวอย่างถูกแสดงผ่าน local state และพร้อมต่อ backend",
      time: "just now",
      kind: "sync",
    },
    {
      id: 2,
      title: "อัปเดตงาน",
      detail: "งานสำคัญที่เสร็จแล้วจะส่งแจ้งเตือนไป LINE ได้จากปุ่มเดียว",
      time: "5 min ago",
      kind: "work",
    },
  ],
};

const STORAGE_KEY = "duosync-collab-v2";

function usePersistentState() {
  const [state, setState] = useState<AppState>(() => {
    if (typeof window === "undefined") return INITIAL_STATE;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    try {
      return JSON.parse(raw) as AppState;
    } catch {
      return INITIAL_STATE;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return [state, setState] as const;
}

function TiltCard({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const [style, setStyle] = useState<React.CSSProperties>({});

  return (
    <div
      onClick={onClick}
      onMouseMove={(e) => {
        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -10;
        const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 10;
        setStyle({
          transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`,
        });
      }}
      onMouseLeave={() => setStyle({ transform: "perspective(1200px) rotateX(0deg) rotateY(0deg)" })}
      className={`relative overflow-hidden rounded-3xl border border-white/12 bg-white/8 backdrop-blur-xl shadow-[0_16px_60px_rgba(0,0,0,0.35)] transition-transform duration-200 ${className}`}
      style={style}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-transparent pointer-events-none" />
      <div className="relative p-5 md:p-6">{children}</div>
    </div>
  );
}

function StatusDot({ status }: { status: Status }) {
  if (status === "done") return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
  if (status === "doing") return <Clock3 className="w-5 h-5 text-amber-400" />;
  return <Circle className="w-5 h-5 text-slate-400" />;
}

export default function App() {
  const [state, setState] = usePersistentState();
  const [tab, setTab] = useState<"dashboard" | "work" | "learn" | "assets" | "timeline">("dashboard");
  const [toast, setToast] = useState<string | null>(null);

  const metrics = useMemo(() => {
    const work = state.tasks.filter((t) => t.type === "work");
    const learn = state.tasks.filter((t) => t.type === "learn");
    const done = state.tasks.filter((t) => t.status === "done").length;
    return {
      workProgress: work.length ? Math.round((work.filter((t) => t.status === "done").length / work.length) * 100) : 0,
      learnProgress: learn.length ? Math.round((learn.filter((t) => t.status === "done").length / learn.length) * 100) : 0,
      doneCount: done,
      openCount: state.tasks.length - done,
    };
  }, [state.tasks]);

  const sendLineUpdate = (message: string) => {
    setToast(message);
    setState((prev) => ({
      ...prev,
      updates: [
        {
          id: Date.now(),
          title: "ส่งแจ้งเตือน LINE",
          detail: message,
          time: "just now",
          kind: "sync",
        },
        ...prev.updates,
      ].slice(0, 8),
    }));
    window.setTimeout(() => setToast(null), 2500);
  };

  const toggleTask = (taskId: number) => {
    setState((prev) => {
      const tasks = prev.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const next = task.status === "todo" ? "doing" : task.status === "doing" ? "done" : "todo";
        return { ...task, status: next };
      });
      const changed = tasks.find((task) => task.id === taskId);
      return {
        ...prev,
        tasks,
        updates: [
          {
            id: Date.now(),
            title: "อัปเดตสถานะงาน",
            detail: changed ? `${changed.title} -> ${changed.status}` : "status changed",
            time: "just now",
            kind: "work",
          },
          ...prev.updates,
        ].slice(0, 8),
      };
    });
  };

  const addDemoAsset = () => {
    const next: Asset = {
      id: Date.now(),
      type: "link",
      title: "Drive folder link",
      url: "https://drive.google.com/drive/folders/1654EojpqzT_fXctvJ9zKfsZkKbsCU9Y7?usp=drive_link",
      addedBy: "user1",
      tag: "drive",
    };
    setState((prev) => ({
      ...prev,
      assets: [next, ...prev.assets],
      updates: [
        {
          id: Date.now(),
          title: "เพิ่มลิงก์ใหม่",
          detail: "บันทึกลิงก์ Google Drive ไว้ในคลังกลางแล้ว",
          time: "just now",
          kind: "asset",
        },
        ...prev.updates,
      ].slice(0, 8),
    }));
    sendLineUpdate("มีการเพิ่มลิงก์ใหม่เข้า Dual Sync แล้ว");
  };

  const uploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setState((prev) => ({
      ...prev,
      assets: [
        {
          id: Date.now(),
          type: "image",
          title: file.name,
          url,
          addedBy: "user1",
          tag: "upload",
        },
        ...prev.assets,
      ],
      updates: [
        {
          id: Date.now(),
          title: "อัปโหลดรูป",
          detail: `เพิ่ม ${file.name} เข้า shared space`,
          time: "just now",
          kind: "asset",
        },
        ...prev.updates,
      ].slice(0, 8),
    }));
    sendLineUpdate(`อัปโหลดรูป ${file.name} สำเร็จ`);
  };

  const Navbar = (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="grid grid-cols-5 gap-1 p-2">
        {[
          ["dashboard", Workflow],
          ["work", Briefcase],
          ["learn", BookOpen],
          ["assets", Share2],
          ["timeline", Calendar],
        ].map(([key, Icon]) => (
          <button
            key={String(key)}
            onClick={() => setTab(key as typeof tab)}
            className={`flex flex-col items-center justify-center rounded-2xl py-2 transition ${
              tab === key ? "bg-white/10 text-white" : "text-slate-400"
            }`}
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}
      </div>
    </div>
  );

  const SectionHeader = ({
    title,
    subtitle,
    icon: Icon,
    tone,
  }: {
    title: string;
    subtitle: string;
    icon: React.ElementType;
    tone: string;
  }) => (
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        <div className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm ${tone}`}>
          <Icon className="h-4 w-4" />
          Dual Sync
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">{subtitle}</p>
      </div>
      <div className="flex gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
          <div className="text-xs text-slate-400">Done</div>
          <div className="text-2xl font-semibold text-white">{metrics.doneCount}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
          <div className="text-xs text-slate-400">Open</div>
          <div className="text-2xl font-semibold text-white">{metrics.openCount}</div>
        </div>
      </div>
    </div>
  );

  const TaskBoard = ({ type }: { type: ItemType }) => {
    const columns: Status[] = ["todo", "doing", "done"];
    const label = type === "work" ? "งาน" : "การเรียนรู้";
    return (
      <div className="grid gap-4 xl:grid-cols-3">
        {columns.map((status) => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium uppercase tracking-[0.22em] text-slate-400">
                {label} • {status}
              </h3>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                {state.tasks.filter((t) => t.type === type && t.status === status).length}
              </span>
            </div>
            {state.tasks
              .filter((task) => task.type === type && task.status === status)
              .map((task) => (
                <TiltCard key={task.id} onClick={() => toggleTask(task.id)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-2 flex items-center gap-2">
                        <StatusDot status={task.status} />
                        <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-slate-200">#{task.id}</span>
                      </div>
                      <p className={`text-sm font-medium md:text-base ${task.status === "done" ? "text-slate-500 line-through" : "text-white"}`}>
                        {task.title}
                      </p>
                      {task.note && <p className="mt-2 text-sm text-slate-400">{task.note}</p>}
                    </div>
                    <img src={USERS[task.assignee].avatar} alt={USERS[task.assignee].name} className="h-10 w-10 rounded-2xl border border-white/10" />
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-400">
                    <span>{task.dueDate}</span>
                    <span>{USERS[task.assignee].name}</span>
                  </div>
                </TiltCard>
              ))}
          </div>
        ))}
      </div>
    );
  };

  const Dashboard = () => (
    <div className="space-y-6 pb-24 md:pb-10">
      <SectionHeader
        title="ศูนย์กลางการทำงานร่วมกันของ 2 คน"
        subtitle="เก็บลิงก์ รูป ไฟล์ สถานะงาน และสิ่งที่ต้องเรียนรู้ไว้ในที่เดียว พร้อมออกแบบให้ใช้งานได้ดีทั้งมือถือและคอมพิวเตอร์"
        icon={Sparkles}
        tone="text-cyan-300"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <TiltCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">Progress งาน</p>
              <p className="mt-2 text-3xl font-semibold text-white">{metrics.workProgress}%</p>
            </div>
            <Briefcase className="h-8 w-8 text-sky-400" />
          </div>
        </TiltCard>
        <TiltCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">Progress เรียนรู้</p>
              <p className="mt-2 text-3xl font-semibold text-white">{metrics.learnProgress}%</p>
            </div>
            <BookOpen className="h-8 w-8 text-fuchsia-400" />
          </div>
        </TiltCard>
        <TiltCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">คลังข้อมูล</p>
              <p className="mt-2 text-3xl font-semibold text-white">{state.assets.length}</p>
            </div>
            <Share2 className="h-8 w-8 text-emerald-400" />
          </div>
        </TiltCard>
        <TiltCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">แจ้งเตือน</p>
              <p className="mt-2 text-3xl font-semibold text-white">LINE</p>
            </div>
            <MessageCircle className="h-8 w-8 text-green-400" />
          </div>
        </TiltCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <TiltCard>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">ภาพรวมสถานะ</h2>
              <p className="mt-1 text-sm text-slate-400">ดูความคืบหน้าทั้งสองหมวดและกดเปลี่ยนสถานะได้ทันที</p>
            </div>
            <button
              onClick={() => sendLineUpdate("สรุปสถานะประจำวันถูกส่งไปที่ LINE แล้ว")}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-500/25"
            >
              <Bell className="h-4 w-4" />
              ส่งสรุป
            </button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-sky-500/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sky-200">งาน</span>
                <span className="text-white">{metrics.workProgress}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400" style={{ width: `${metrics.workProgress}%` }} />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-fuchsia-500/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-fuchsia-200">เรียนรู้</span>
                <span className="text-white">{metrics.learnProgress}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-400" style={{ width: `${metrics.learnProgress}%` }} />
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {state.tasks.slice(0, 4).map((task) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusDot status={task.status} />
                    <span className="truncate text-sm text-white">{task.title}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    {USERS[task.assignee].name} · {task.dueDate}
                  </div>
                </div>
                <span className="text-xs text-slate-300">{task.type}</span>
              </button>
            ))}
          </div>
        </TiltCard>

        <TiltCard>
          <h2 className="text-xl font-semibold text-white">โครงสร้างการใช้งานจริง</h2>
          <div className="mt-4 space-y-4 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <Cloud className="h-5 w-5 text-sky-300" />
                <span>Google Drive เป็นแหล่งเก็บกลาง</span>
              </div>
              <p className="mt-2 text-slate-400">แยกโฟลเดอร์ตามงาน, เรียนรู้, และคลังอ้างอิง เพื่อค้นหาง่ายและไม่ปนกัน</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-green-400" />
                <span>LINE ใช้ส่งสถานะสำคัญ</span>
              </div>
              <p className="mt-2 text-slate-400">เช่น เสร็จงาน, เพิ่มลิงก์ใหม่, สรุปประจำวัน, และเตือนงานใกล้ครบกำหนด</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-fuchsia-300" />
                <span>Responsive จริง</span>
              </div>
              <p className="mt-2 text-slate-400">Mobile-first navigation, cards ที่กดง่าย, ตัวอักษรอ่านชัด และโครงสร้างเดียวกันทั้ง Windows/Mac</p>
            </div>
          </div>
        </TiltCard>
      </div>
    </div>
  );

  const Assets = () => (
    <div className="space-y-6 pb-24 md:pb-10">
      <SectionHeader
        title="คลังลิงก์ รูป และไฟล์อ้างอิง"
        subtitle="พื้นที่นี้เหมาะสำหรับบันทึก resource ที่ใช้ร่วมกันและเปิดดูได้เร็วบนทุกอุปกรณ์"
        icon={Share2}
        tone="text-fuchsia-300"
      />
      <div className="flex flex-wrap gap-3">
        <button
          onClick={addDemoAsset}
          className="inline-flex items-center gap-2 rounded-full bg-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-fuchsia-500/25"
        >
          <Plus className="h-4 w-4" />
          เพิ่มลิงก์ Drive
        </button>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">
          <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
          <Upload className="h-4 w-4" />
          อัปโหลดรูป
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {state.assets.map((asset) => (
          <TiltCard key={asset.id}>
            {asset.type === "image" ? (
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <img src={asset.url} alt={asset.title} className="h-44 w-full object-cover transition duration-500 hover:scale-105" />
              </div>
            ) : (
              <div className="flex h-44 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800">
                <LinkIcon className="h-12 w-12 text-fuchsia-300" />
              </div>
            )}
            <div className="mt-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{asset.title}</p>
                <p className="mt-1 text-xs text-slate-400">{asset.tag ?? "reference"}</p>
                <a href={asset.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-cyan-300 hover:underline">
                  เปิดลิงก์
                </a>
              </div>
              <img src={USERS[asset.addedBy].avatar} alt={USERS[asset.addedBy].name} className="h-8 w-8 rounded-xl" />
            </div>
          </TiltCard>
        ))}
      </div>
    </div>
  );

  const Timeline = () => (
    <div className="space-y-6 pb-24 md:pb-10">
      <SectionHeader
        title="สรุปการอัปเดต"
        subtitle="ใช้เป็น activity feed ส่วนกลางสำหรับติดตามการเคลื่อนไหวทั้งหมดของทีม 2 คน"
        icon={Bell}
        tone="text-emerald-300"
      />
      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <TiltCard>
          <div className="space-y-4">
            {state.updates.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mt-1 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.6)]" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{item.title}</span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-300">
                      {item.kind}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{item.detail}</p>
                  <p className="mt-2 text-xs text-slate-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </TiltCard>
        <TiltCard>
          <h3 className="text-lg font-semibold text-white">ข้อเสนอให้สมบูรณ์แบบขึ้น</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>1. เชื่อม backend จริงด้วย Google Apps Script หรือ Firebase เพื่อ sync ข้อมูลข้ามเครื่อง</li>
            <li>2. เพิ่ม permission แบบ 2 users only พร้อม activity log และเวอร์ชันประวัติไฟล์</li>
            <li>3. ทำ auto reminder เวลาใกล้ deadline และสรุปประจำวันส่ง LINE อัตโนมัติ</li>
            <li>4. เพิ่ม drag-and-drop สำหรับ card และอัปโหลดไฟล์เข้าลิงก์ Drive โดยตรง</li>
            <li>5. ใส่ offline cache และ push sync เมื่อกลับมาออนไลน์</li>
          </ul>
          <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/15 to-sky-500/10 p-4 text-sm text-slate-200">
            ถ้าต้องการ ผมต่อยอดเป็นเวอร์ชัน production ได้ต่อทันที โดยแยกเป็น API, auth, Google Drive integration และ LINE Messaging flow จริง
          </div>
        </TiltCard>
      </div>
    </div>
  );

  const Work = () => (
    <div className="space-y-6 pb-24 md:pb-10">
      <SectionHeader
        title="งานและอัปเดตงาน"
        subtitle="ใช้สำหรับ tracking งานที่กำลังทำ อยู่ระหว่างทำ และเสร็จแล้วแบบแตะครั้งเดียว"
        icon={Briefcase}
        tone="text-sky-300"
      />
      <TaskBoard type="work" />
    </div>
  );

  const Learn = () => (
    <div className="space-y-6 pb-24 md:pb-10">
      <SectionHeader
        title="ส่วนการเรียนรู้"
        subtitle="เก็บ topic, reference, และ milestone การเรียนรู้ของทั้งสองคนไว้ในพื้นที่เดียว"
        icon={BookOpen}
        tone="text-fuchsia-300"
      />
      <TaskBoard type="learn" />
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#060816] text-slate-200">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute right-0 top-28 h-96 w-96 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {toast && (
        <div className="fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-emerald-500/90 px-5 py-3 text-sm font-medium text-white shadow-2xl">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            {toast}
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-white/5 p-6 backdrop-blur-xl md:flex md:flex-col">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-fuchsia-500">
              <Share2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-lg font-semibold text-white">Dual Sync</div>
              <div className="text-xs text-slate-400">2-person collaboration hub</div>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            {[
              ["dashboard", "ภาพรวม", Workflow],
              ["work", "งาน", Briefcase],
              ["learn", "เรียนรู้", BookOpen],
              ["assets", "คลังข้อมูล", Share2],
              ["timeline", "อัปเดต", Calendar],
            ].map(([key, label, Icon]) => (
              <button
                key={String(key)}
                onClick={() => setTab(key as typeof tab)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                  tab === key ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <img src={USERS.user1.avatar} alt={USERS.user1.name} className="h-11 w-11 rounded-2xl" />
              <img src={USERS.user2.avatar} alt={USERS.user2.name} className="h-11 w-11 rounded-2xl -ml-4 border border-slate-950" />
              <div>
                <div className="text-sm text-white">2 คนออนไลน์</div>
                <div className="text-xs text-slate-400">พร้อมซิงก์และแจ้งเตือน</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 px-4 py-5 md:px-8 md:py-8">
          <div className="mx-auto max-w-7xl">
            {tab === "dashboard" && <Dashboard />}
            {tab === "work" && <Work />}
            {tab === "learn" && <Learn />}
            {tab === "assets" && <Assets />}
            {tab === "timeline" && <Timeline />}
          </div>
        </main>
      </div>

      {Navbar}

      <style>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }
      `}</style>
    </div>
  );
}

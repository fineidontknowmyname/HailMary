import React from 'react';

interface SectionProps {
  num: string;
  title: string;
  desc: string;
  children: React.ReactNode;
}

interface CardGridProps {
  children: React.ReactNode;
}

interface InfoCardProps {
  icon: string;
  title: string;
  body: string;
}

interface StepListProps {
  children: React.ReactNode;
}

interface StepProps {
  num: string | number;
  title: string;
  children: React.ReactNode;
}

type CalloutType = 'tip' | 'warn' | 'info' | 'danger';

interface CalloutProps {
  type: CalloutType;
  title: string;
  children: React.ReactNode;
}

interface SandboxProps {
  type: 'terminal' | 'api' | 'firestore';
  defaultCode?: string;
  defaultUrl?: string;
}

const CALLOUT_STYLES: Record<CalloutType, { border: string; bg: string; icon: string; label: string; color: string }> = {
  tip:    { border: 'border-[#4fffb0]', bg: 'bg-[#4fffb0]/5',  icon: '💡', label: 'Tip',    color: 'text-[#4fffb0]'  },
  warn:   { border: 'border-yellow-400', bg: 'bg-yellow-400/5', icon: '⚠️', label: 'Warning', color: 'text-yellow-400' },
  info:   { border: 'border-blue-400',   bg: 'bg-blue-400/5',   icon: 'ℹ️', label: 'Info',    color: 'text-blue-400'   },
  danger: { border: 'border-red-500',    bg: 'bg-red-500/5',    icon: '🚨', label: 'Danger',  color: 'text-red-400'    },
};

export function Section({ num, title, desc, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-8 py-10 border-t border-[#1e2535] first:border-0">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#7a849a]">
          {num}
        </span>
        <h2 className="text-2xl font-black tracking-tight text-white">{title}</h2>
        <p className="text-[#7a849a] text-sm leading-relaxed max-w-xl">{desc}</p>
      </div>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}

export function CardGrid({ children }: CardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  );
}

export function InfoCard({ icon, title, body }: InfoCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#1e2535] bg-[#111520] p-5 transition-colors hover:border-[#2a3145]">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      <p className="text-xs text-[#7a849a] leading-relaxed">{body}</p>
    </div>
  );
}

export function StepList({ children }: StepListProps) {
  return (
    <ol className="flex flex-col gap-4">
      {children}
    </ol>
  );
}

export function Step({ num, title, children }: StepProps) {
  return (
    <li className="flex gap-4 rounded-xl border border-[#1e2535] bg-[#111520] p-5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#161b27] border border-[#1e2535] text-xs font-black font-mono text-[#4fffb0]">
        {num}
      </span>
      <div className="flex flex-col gap-1.5 min-w-0">
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <div className="text-xs text-[#7a849a] leading-relaxed [&_code]:rounded [&_code]:bg-[#0b0e14] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[#4fffb0]">
          {children}
        </div>
      </div>
    </li>
  );
}

export function Callout({ type, title, children }: CalloutProps) {
  const s = CALLOUT_STYLES[type];
  return (
    <div className={`rounded-xl border-l-4 ${s.border} ${s.bg} px-5 py-4`}>
      <div className={`flex items-center gap-2 mb-2 text-sm font-bold ${s.color}`}>
        <span>{s.icon}</span>
        <span>{s.label}: {title}</span>
      </div>
      <div className="text-xs text-[#7a849a] leading-relaxed [&_code]:rounded [&_code]:bg-[#0b0e14] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-white">
        {children}
      </div>
    </div>
  );
}

export function Sandbox({ type, defaultCode = '', defaultUrl = '' }: SandboxProps) {
  const [value, setValue] = React.useState(defaultCode || defaultUrl);
  const [output, setOutput] = React.useState<string | null>(null);
  const [running, setRunning] = React.useState(false);

  const simulate = async () => {
    setRunning(true);
    setOutput(null);
    await new Promise((r) => setTimeout(r, 900));

    if (type === 'terminal') {
      const cmd = value.trim();
      const responses: Record<string, string> = {
        'git init':                    '$ git init\nInitialized empty Git repository in /project/.git/',
        'git status':                  '$ git status\nOn branch main\nnothing to commit, working tree clean',
        'git log --oneline':           '$ git log --oneline\na3f92c1 feat: add landing page\nb7e110d chore: initial commit',
        'git add .':                   '$ git add .\n(all changes staged)',
        'git branch':                  '$ git branch\n* main\n  feature/auth\n  hotfix/login-crash',
        'git stash':                   '$ git stash\nSaved working directory and index state WIP on main: a3f92c1',
        'docker ps':                   'CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS                    NAMES\na8f3c1d92e11   nginx:alpine   "/docker-entrypoint.…"   2 minutes ago   Up 2 minutes   0.0.0.0:8080->80/tcp     web\n3b9e7f204c12   postgres:15    "docker-entrypoint.s…"   5 minutes ago   Up 5 minutes   5432/tcp                 db',
        'docker images':               'REPOSITORY    TAG       IMAGE ID       CREATED        SIZE\nnginx         alpine    3f8a4339aadd   2 days ago     43.2MB\nnode          20-alpine  b1e0218b4c32   4 days ago     173MB\npostgres      15        9f3ec01f884d   1 week ago     412MB',
        'docker run hello-world':      '$ docker run hello-world\n\nHello from Docker!\nThis message shows that your installation appears to be working correctly.\n\nTo generate this message, Docker took the following steps:\n 1. The Docker client contacted the Docker daemon.\n 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.\n 3. The Docker daemon created a new container from that image.\n 4. The Docker daemon streamed that output to the Docker client.',
        'docker stop web':             '$ docker stop web\nweb',
        'docker rm web':               '$ docker rm web\nweb',
        'docker build -t myapp .':     '$ docker build -t myapp .\n[+] Building 12.4s (9/9) FINISHED\n => [internal] load build definition from Dockerfile        0.1s\n => [internal] load .dockerignore                          0.0s\n => [1/4] FROM node:20-alpine                              3.2s\n => [2/4] WORKDIR /app                                     0.0s\n => [3/4] COPY package*.json ./                            0.1s\n => [4/4] RUN npm ci                                       8.3s\n => exporting to image                                     0.7s\nSuccessfully built c3a7f19e22bb\nSuccessfully tagged myapp:latest',
        'docker compose up':           '$ docker compose up\n[+] Running 3/3\n ✔ Network myapp_default  Created        0.1s\n ✔ Container myapp-db-1   Started        0.9s\n ✔ Container myapp-web-1  Started        1.2s\nmyapp-web-1  | Server running on http://localhost:3000',
        'docker volume ls':            'DRIVER    VOLUME NAME\nlocal     myapp_postgres_data\nlocal     myapp_redis_data',
        'docker network ls':           'NETWORK ID     NAME              DRIVER    SCOPE\n3f1a9c204b11   bridge            bridge    local\n8d7e3a109c22   myapp_default     bridge    local\n7b2c1f308d33   host              host      local',
        'firebase init':               '$ firebase init\n✔ Which Firebase features? Firestore, Hosting, Functions\n✔ Project: my-project-abc123\n✔ Firestore Rules: firestore.rules\n✔ Firestore Indexes: firestore.indexes.json\n✔ Hosting public directory: dist\n✔ Configure as single-page app? Yes\n✔ Firebase initialization complete!',
        'firebase deploy':             '$ firebase deploy\n=== Deploying to: my-project-abc123\ni  deploying firestore, hosting\n✔  firestore: released rules firestore.rules\n✔  hosting: 14 files uploaded successfully\n✔  Deploy complete!\n\nProject Console: https://console.firebase.google.com/project/my-project-abc123\nHosting URL: https://my-project-abc123.web.app',
        'firebase emulators:start':    '$ firebase emulators:start\ni  Starting emulators: auth, firestore, hosting\n✔  firestore: Firestore Emulator running at localhost:8080\n✔  auth: Authentication Emulator running at localhost:9099\n✔  hosting: Hosting Emulator running at localhost:5000\n✔  All emulators ready!',
      };
      setOutput(responses[cmd] ?? `$ ${cmd}\nSimulated: command executed successfully. Exit code 0.`);

    } else if (type === 'firestore') {
      const query = value.trim();
      const firestoreResponses: Record<string, string> = {
        'collection("users").get()': `[firestore] → collection("users").get()\n\nSnapshot: 3 documents returned\n────────────────────────────────────\ndoc[0]: {\n  id: "uid_aX9k2mP",\n  data: {\n    name: "Ada Lovelace",\n    email: "ada@example.com",\n    role: "admin",\n    createdAt: Timestamp(2024-01-15)\n  }\n}\ndoc[1]: {\n  id: "uid_bR7n4qL",\n  data: {\n    name: "Grace Hopper",\n    email: "grace@example.com",\n    role: "member",\n    createdAt: Timestamp(2024-02-03)\n  }\n}\ndoc[2]: {\n  id: "uid_cS5m8wK",\n  data: {\n    name: "Linus Torvalds",\n    email: "linus@example.com",\n    role: "member",\n    createdAt: Timestamp(2024-02-20)\n  }\n}`,
        'collection("users").where("role","==","admin").get()': `[firestore] → where("role", "==", "admin")\n\nSnapshot: 1 document returned\n────────────────────────────────────\ndoc[0]: {\n  id: "uid_aX9k2mP",\n  data: {\n    name: "Ada Lovelace",\n    email: "ada@example.com",\n    role: "admin",\n    createdAt: Timestamp(2024-01-15)\n  }\n}`,
        'doc("users/uid_aX9k2mP").get()': `[firestore] → doc("users/uid_aX9k2mP").get()\n\nDocument exists: true\n────────────────────────────────────\n{\n  id: "uid_aX9k2mP",\n  data: {\n    name: "Ada Lovelace",\n    email: "ada@example.com",\n    role: "admin",\n    score: 2480,\n    createdAt: Timestamp(2024-01-15)\n  }\n}`,
        'collection("posts").orderBy("createdAt","desc").limit(3).get()': `[firestore] → orderBy("createdAt", "desc").limit(3)\n\nSnapshot: 3 documents returned\n────────────────────────────────────\ndoc[0]: { id: "post_3", data: { title: "Mastering Indexes", views: 1204 } }\ndoc[1]: { id: "post_2", data: { title: "Security Rules Deep Dive", views: 873 } }\ndoc[2]: { id: "post_1", data: { title: "Getting Started", views: 4521 } }`,
      };
      setOutput(
        firestoreResponses[query] ??
        `[firestore] → ${query}\n\nSnapshot: 1 document returned\n────────────────────────────────────\n{\n  id: "doc_simulated",\n  data: { field: "value", count: 42, active: true }\n}`
      );

    } else {
      setOutput(`GET ${value}\n\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{ "status": "ok", "simulated": true }`);
    }

    setRunning(false);
  };

  const label = type === 'terminal' ? '$ terminal'
    : type === 'firestore' ? '🔥 Firestore Query Simulator'
    : '⚡ HTTP request';

  return (
    <div className="rounded-xl border border-[#1e2535] bg-[#0b0e14] overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#1e2535] bg-[#111520] px-4 py-2.5">
        <span className="text-xs font-mono text-[#7a849a]">{label}</span>
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500/60" />
          <span className="h-3 w-3 rounded-full bg-yellow-400/60" />
          <span className="h-3 w-3 rounded-full bg-[#4fffb0]/60" />
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={type === 'terminal' ? 2 : 3}
          spellCheck={false}
          className="w-full resize-none rounded-lg border border-[#1e2535] bg-[#161b27] p-3 font-mono text-sm text-white placeholder-[#7a849a] outline-none focus:border-[#4fffb0] transition-colors"
          placeholder={type === 'terminal' ? 'Enter a git command...' : 'Enter URL or query...'}
        />

        <button
          onClick={simulate}
          disabled={running || !value.trim()}
          className="self-start inline-flex items-center gap-2 rounded-lg bg-[#4fffb0] px-4 py-2 text-xs font-bold text-[#0b0e14] transition-all hover:bg-[#3de89e] active:scale-95 disabled:opacity-40"
        >
          {running ? (
            <>
              <span className="h-3 w-3 rounded-full border-2 border-[#0b0e14] border-t-transparent animate-spin" />
              Running…
            </>
          ) : '▶ Run'}
        </button>

        {output && (
          <pre className="whitespace-pre-wrap rounded-lg border border-[#1e2535] bg-[#161b27] p-4 font-mono text-xs text-[#4fffb0] leading-relaxed">
            {output}
          </pre>
        )}
      </div>
    </div>
  );
}

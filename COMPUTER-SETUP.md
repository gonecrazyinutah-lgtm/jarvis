# Put JARVIS on your computer

You can download the **Jarvis-Computer-Setup.zip** file on your phone and transfer
it to your computer, or download the project ZIP directly onto your computer.
**Unzip it on the computer** (rather than running files from inside the ZIP).
The ZIP contains the source code, interface assets and starter scripts. It does
**not** contain anyone's account, login, API keys, Node.js, browser, or
OS-specific dependencies; those must be set up on your own computer.

## 1. Install the three requirements on the computer

1. **Node.js:** install the current LTS version from <https://nodejs.org>.
   This project needs Node **22.12+** (or **20.19+**); restart your terminal
   after installation. You can check with `node --version`.
2. **Claude Code:** this assistant's brain uses your Claude Code subscription
   and an internet connection. Install the CLI on the computer using the
   [official instructions](https://docs.claude.com/en/docs/claude-code), or
   run `npm install -g @anthropic-ai/claude-code` in a terminal. Then run
   **`claude` once on that computer and complete sign-in**. Your phone's login
   or this chat does not sign in the computer automatically. Don't send anyone
   your password, tokens, or Claude configuration files.
3. **Google Chrome or Microsoft Edge:** install either, then use an ordinary
   browser window for JARVIS. An editor's embedded preview may display the UI
   but cannot reliably access the microphone.

You do **not** need an Anthropic API key, ElevenLabs key or MCP server for a
basic conversation. ElevenLabs and other tool integrations are optional.

## 2. Start it

In the unzipped project folder, choose the launcher for your computer:

| Computer | What to do |
|---|---|
| Windows | Double-click **`Start-Jarvis-Windows.cmd`**. If SmartScreen warns about a downloaded script, inspect it before allowing it. |
| Mac | Double-click **`Start-Jarvis-Mac.command`** in Finder, or open Terminal in this folder and run `sh Start-Jarvis-Mac.command`. |
| Linux | Open a terminal in this folder and run `sh Start-Jarvis-Linux.sh`. |

The launcher installs the project's dependencies **on this computer** on first
run (requires internet), prints a readiness check, then starts the brain and
interface. Leave its terminal open while using JARVIS. It starts in **read-only
mode**: it does not have permission to send messages, change files, or control
your devices by default. If it says Claude Code is missing, finish step 1 and
run it again.

Prefer manual commands? In the unzipped folder, open **Command Prompt** on
Windows or **Terminal** on Mac/Linux and run:

```text
npm ci
npm run setup
npm start
```

Run `claude` to sign in before `npm start`. `npm ci` reads the included lockfile
and installs dependencies for *your* operating system; don't copy `node_modules`
from another computer. If you change computers or upgrade Node, run `npm ci`
again. `npm run setup` is an advisory check; it does not log you in.

## 3. Use it

When the terminal says the face is ready, open **http://localhost:5173** in
**Chrome or Edge on the same computer**. Click **INITIALISE**, allow microphone
access, and say **“Hey Jarvis”**. You can also hold **Space** to talk. Press
**D** for voice diagnostics or **T** for a sound test. To stop it, press
**Ctrl+C** in the running terminal (or close that terminal).

`localhost` means *that computer*. This setup deliberately doesn't expose the
agent to your phone or other devices on the network. The model needs an internet
connection and an active Claude Code login/subscription; it is not an offline
copy of the AI. Voice recognition may use your browser's online speech service.

## Optional settings and troubleshooting

- To improve speech with ElevenLabs, copy `.env.example` to **`.env.local`** in
  the project folder. Uncomment `ELEVENLABS_API_KEY=`, add your key, then restart
  JARVIS. `.env.local` is ignored by Git; **never share it or put a secret in a
  `VITE_` variable**, which would reach the browser.
- If the page opens but never answers, check the launcher for errors; run
  `claude` in a separate terminal and make sure it is signed in. Check
  `http://localhost:8787/health` in the computer's browser: it should show
  `"ok":true`. If a port is already in use, close the other copy of JARVIS.
- If it cannot hear you, use a real Chrome/Edge window on the computer, allow
  microphone access for `localhost`, and press **D** to check diagnostics.
- Other services (mail, phone control, searches through MCP servers) only work
  if **you configure those services on that computer** in Claude Code. The
  connections for this chat do not transfer into the program automatically.
- Don't start with `--writes` unless you understand the permission policy in
  the main README. The default read-only mode is safer while you try it out.

For architecture, controls and advanced configuration, see [README.md](README.md).

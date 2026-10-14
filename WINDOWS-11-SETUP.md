# JARVIS on Windows 11 Home

Windows 11 Home is fine; use the **Windows** launcher. You do not have to set up
the Mac/Linux launchers or transfer `node_modules` from another computer.

## Do this on your Windows PC

1. **Download and extract JARVIS.** Save the project ZIP from this conversation
   (or [download it from the JARVIS branch on GitHub](https://github.com/gonecrazyinutah-lgtm/jarvis/archive/refs/heads/arena/d39d5f93-jarvis.zip)).
   In File Explorer, right-click the ZIP → **Extract All**. Open the extracted
   project folder (named `jarvis` in the transfer ZIP; GitHub's ZIP may use a
   longer name). Don't double-click a program while it is still inside the ZIP.
   Your Documents folder is a good place for it.
2. **Install Node.js.** Download the current **LTS** installer from
   <https://nodejs.org> and run it. JARVIS needs Node 22.12+ (or 20.19+).
   Close and reopen Command Prompt afterward; `node --version` should show
   the version you installed.
3. **Install and sign in to Claude Code.** Open **PowerShell** or **Windows
   Terminal** and run:

   ```powershell
   winget install Anthropic.ClaudeCode
   ```

   That is Anthropic's recommended Windows install method. If `winget` is not
   available, follow the [official Claude Code setup guide](https://code.claude.com/docs/en/setup).
   Close and reopen your terminal; type **`claude`** and complete sign-in there.
   You need a Claude Code account/subscription on this PC. This phone chat
   cannot sign the PC in for you. **Don't send anyone your login or API keys.**
4. **Start JARVIS.** In that extracted project folder, double-click
   **`Start-Jarvis-Windows.cmd`**. On first run it installs its own packages
   using your internet connection; this can take a few minutes. Keep the black
   terminal window open. The script starts in **read-only mode**. If Windows
   blocks a downloaded script, read its contents before deciding whether to
   allow it; you can also run it from Command Prompt in that folder.
5. **Open the interface in Microsoft Edge** (already on most Windows 11 PCs):
   type **http://localhost:5173** in the address bar. Click **INITIALISE**,
   allow microphone access, then say **“Hey Jarvis”**. You can hold the **Space**
   key to talk. Press **D** for diagnostics or **T** for a sound test.

**To stop JARVIS:** press **Ctrl+C** in its terminal window. To start it next
time, double-click the same Windows launcher; it won't reinstall packages if
they're already there.

## If something doesn't work

- **“Node.js is missing” or “Claude Code is not installed”:** finish steps 2
  and 3, then reopen the terminal/launcher. In Command Prompt, check
  `node --version` and `claude --version`. You do *not* need to run as
  Administrator just to use the app.
- **The page opens but doesn't answer:** in another terminal run `claude` to
  check you're signed in; in Edge, visit **http://localhost:8787/health** to
  check the local bridge is up (look for `"ok":true`). Watch the JARVIS terminal
  for an error. This setup has not been tested with *your* account yet.
- **It cannot hear you:** click the lock/site icon next to the URL in Edge and
  allow the microphone for `localhost`. In Windows, go to **Settings → Privacy
  & security → Microphone** and turn on microphone access and desktop-app
  access. Use Edge as a normal window, not an embedded preview.
- **PowerShell refuses `npm.ps1`:** you don't need PowerShell to start JARVIS;
  double-click the `.cmd` launcher or use **Command Prompt**. The Claude Code
  `winget` install above can still be run in PowerShell.

The model needs an internet connection. Voice recognition can use Edge's online
speech service. Email, phone control and other extra tools are **not connected
by this ZIP**; they require your own configuration on your computer. See
[COMPUTER-SETUP.md](COMPUTER-SETUP.md) for more detail.

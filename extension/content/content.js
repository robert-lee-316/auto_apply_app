/* global AutoApplyRegistry, AutoApplyDom */

(function () {
  if (window.__autoApplyContentLoaded) return;
  window.__autoApplyContentLoaded = true;

  if (window !== window.top) return;

  const platformId = AutoApplyRegistry.detectPlatform();
  if (!platformId) return;

  let running = false;

  function showToast(message, type = "info") {
    const id = "autoapply-toast";
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      Object.assign(el.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: "2147483647",
        maxWidth: "360px",
        padding: "12px 16px",
        borderRadius: "10px",
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "13px",
        boxShadow: "0 8px 24px rgba(0,0,0,.2)",
        color: "#fff",
        background: type === "error" ? "#b91c1c" : "#111827"
      });
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.style.background = type === "error" ? "#b91c1c" : "#111827";
    setTimeout(() => el.remove(), 8000);
  }

  async function runApply(profile, sendResponse) {
    if (running) {
      sendResponse?.({ ok: false, message: "Already running on this tab." });
      return;
    }
    running = true;
    const logs = [];
    const log = (msg) => {
      logs.push(msg);
      console.log("[AutoApply]", msg);
    };

    try {
      showToast(`AutoApply: ${AutoApplyRegistry.label(platformId)}…`);
      const result = await AutoApplyRegistry.apply(platformId, profile, log);
      showToast(`Done: ${result.status}. Review before submit.`);
      sendResponse?.({ ok: true, result, logs });
    } catch (err) {
      showToast(err.message || "Apply failed", "error");
      sendResponse?.({ ok: false, message: err.message, logs });
    } finally {
      running = false;
    }
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.action === "ping") {
      sendResponse({ ok: true, platform: platformId });
      return false;
    }
    if (msg?.action === "apply" && msg.profile) {
      runApply(msg.profile, sendResponse);
      return true;
    }
    if (msg?.action === "fillOnce" && msg.profile) {
      (async () => {
        const log = (m) => console.log("[AutoApply]", m);
        await AutoApplyDom.sleep(300);
        await AutoApplyRegistry.apply(platformId, msg.profile, log);
        showToast("Filled current page.");
        sendResponse({ ok: true });
      })();
      return true;
    }
  });

  console.info(`[AutoApply] Ready on ${AutoApplyRegistry.label(platformId)}`);
})();

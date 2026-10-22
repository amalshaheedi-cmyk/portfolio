(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Scroll reveal with per-group stagger
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-visible");
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  document.querySelectorAll(".work, .jobs, .about, .contact").forEach((group) => {
    group.querySelectorAll("[data-reveal]").forEach((el, i) => el.style.setProperty("--d", `${i * 0.12}s`));
  });
  document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

  // Active nav link follows scroll position
  const links = [...document.querySelectorAll(".nav a")];
  const targets = links.map((a) => document.getElementById(a.dataset.section));
  const setActive = () => {
    const y = scrollY + innerHeight * 0.4;
    let idx = 0;
    targets.forEach((t, i) => { if (t && t.getBoundingClientRect().top + scrollY <= y) idx = i; });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) idx = links.length - 1;
    links.forEach((a, i) => a.classList.toggle("is-active", i === idx));
  };

  // Nav turns into a dark glass pill once it leaves the gradient
  const navEl = document.querySelector(".nav");

  // Light parallax on the streak artwork
  const para = document.querySelector("[data-parallax]");
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      setActive();
      navEl.classList.toggle("is-scrolled", scrollY > innerHeight * 0.5);
      if (para && !reduce) para.parentElement.style.transform = `translate(-50%, ${scrollY * 0.12}px)`;
      ticking = false;
    });
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", setActive);
  setActive();

  // Subtle pointer tilt on cards
  if (!reduce && matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.querySelector("img").style.transform = `scale(1.04) translate(${x * -10}px, ${y * -10}px)`;
      });
      card.addEventListener("pointerleave", () => { card.querySelector("img").style.transform = ""; });
    });
  }

  // Interactive gradient: blobs shift away from the cursor, a glow follows it, clicks send a ripple
  const aurora = document.querySelector(".aurora");
  if (aurora && !reduce && matchMedia("(hover: hover)").matches) {
    let tx = innerWidth / 2, ty = 300, cx = tx, cy = ty, raf = 0;
    const loop = () => {
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
      aurora.style.setProperty("--gx", `${cx}px`); aurora.style.setProperty("--gy", `${cy}px`);
      aurora.style.setProperty("--px", ((cx / innerWidth) - 0.5) * 120);
      aurora.style.setProperty("--py", ((cy / innerHeight) - 0.5) * 90);
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    const inside = (y) => y + scrollY < aurora.offsetHeight * 0.85;
    addEventListener("pointermove", (e) => {
      const hot = inside(e.clientY);
      aurora.classList.toggle("is-hot", hot);
      if (!hot) return;
      tx = e.clientX; ty = e.clientY + scrollY;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    document.addEventListener("pointerleave", () => aurora.classList.remove("is-hot"));
    addEventListener("pointerdown", (e) => {
      if (!inside(e.clientY) || e.target.closest("a, .card, .nav")) return;
      const r = document.createElement("span");
      r.className = "ripple"; r.style.left = `${e.clientX}px`; r.style.top = `${e.clientY + scrollY}px`;
      aurora.appendChild(r); r.addEventListener("animationend", () => r.remove());
      aurora.style.setProperty("--gs", 1.6); setTimeout(() => aurora.style.setProperty("--gs", 1), 250);
    });
  }

  // Click the email to copy it (mailto still works via middle/cmd-click)
  document.querySelectorAll("[data-copy]").forEach((a) => {
    a.addEventListener("click", async (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || !navigator.clipboard) return;
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(a.getAttribute("href").replace("mailto:", ""));
        a.classList.add("is-copied");
        setTimeout(() => a.classList.remove("is-copied"), 1600);
      } catch { location.href = a.href; }
    });
  });
})();

/* password-protected case studies (client-side gate only) */
(() => {
  const KEY = "aw-unlocked", PASS = atob("YW1hbHN3b3Jr");
  const dlg = document.getElementById("pw"); if (!dlg) return;
  const input = document.getElementById("pw-input"), err = document.getElementById("pw-err");
  let target = null;
  const unlocked = () => sessionStorage.getItem(KEY) === "1";
  const mark = () => unlocked() && document.body.classList.add("is-unlocked");
  mark();
  document.querySelectorAll(".card[data-locked]").forEach(a => {
    a.setAttribute("aria-label", a.getAttribute("aria-label") + " (password protected)");
    a.addEventListener("click", e => {
      if (unlocked()) return;
      e.preventDefault(); target = a.getAttribute("href");
      input.value = ""; err.hidden = true; dlg.classList.remove("is-error");
      dlg.showModal(); input.focus();
    });
  });
  dlg.querySelector("form").addEventListener("submit", e => {
    e.preventDefault();
    if (input.value.trim() === PASS) {
      sessionStorage.setItem(KEY, "1"); mark(); dlg.close();
      if (target) location.href = target;
    } else {
      err.hidden = false; dlg.classList.remove("is-error"); void dlg.offsetWidth; dlg.classList.add("is-error");
      input.select();
    }
  });
  document.getElementById("pw-cancel").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
})();

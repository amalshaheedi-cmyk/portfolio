(() => {
  // Scroll reveal with stagger inside each group
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-visible");
      e.target.querySelectorAll(".chart").forEach((c) => c.classList.add("is-in"));
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  document.querySelectorAll("[data-reveal]").forEach((el) => {
    const i = [...el.parentElement.querySelectorAll(":scope > [data-reveal]")].indexOf(el);
    el.style.setProperty("--d", `${Math.max(i, 0) * 0.08}s`);
    io.observe(el);
  });

  // Pins and notes highlight each other
  const hot = (n, on) => document.querySelectorAll(`[data-pin="${n}"], [data-note="${n}"]`).forEach((el) => el.classList.toggle("is-hot", on));
  document.querySelectorAll("[data-pin], [data-note]").forEach((el) => {
    const n = el.dataset.pin || el.dataset.note;
    el.addEventListener("pointerenter", () => hot(n, true));
    el.addEventListener("pointerleave", () => hot(n, false));
  });

  // Interactive filter demo
  const dds = [...document.querySelectorAll(".dd")];
  const input = document.getElementById("demo-input");
  const close = () => dds.forEach((d) => { d.classList.remove("is-open"); d.querySelector(".chip").setAttribute("aria-expanded", "false"); });
  dds.forEach((dd) => {
    const chip = dd.querySelector(".chip");
    const label = chip.querySelector("span");
    const base = label.textContent;
    chip.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !dd.classList.contains("is-open");
      close();
      dd.classList.toggle("is-open", open);
      chip.setAttribute("aria-expanded", String(open));
    });
    dd.querySelectorAll(".menu li").forEach((li) => {
      li.tabIndex = 0;
      const pick = (e) => {
        e.stopPropagation();
        const was = li.classList.contains("is-picked");
        dd.querySelectorAll(".menu li").forEach((x) => x.classList.remove("is-picked"));
        if (was) { label.textContent = base; chip.classList.toggle("is-on", dd.dataset.key !== "content" && dd.dataset.key !== "more"); }
        else { li.classList.add("is-picked"); label.textContent = li.textContent.trim(); chip.classList.add("is-on"); }
        if (dd.dataset.key === "content") input.placeholder = was ? "Search infographics" : `Search ${li.textContent.trim().toLowerCase()}s`.replace("ss", "s");
        close();
      };
      li.addEventListener("click", pick);
      li.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(e); } });
    });
  });
  document.addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  // Section nav: highlight the section in view
  const links = [...document.querySelectorAll(".snav a")];
  const secs = links.map((l) => document.querySelector(l.getAttribute("href")));
  const spy = () => {
    let cur = 0;
    secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= innerHeight * 0.4) cur = i; });
    links.forEach((l, i) => l.classList.toggle("is-active", i === cur));
  };
  addEventListener("scroll", spy, { passive: true });
  spy();

  // Click the email to copy it
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

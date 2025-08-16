"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./ApprovalForm.module.css";

export default function ApprovalForm() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [status, setStatus] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const onLoad = () => {
      if (submitted) {
        setSubmitted(false);
        setStatus("✅ Thanks! Your request was sent.");
        // reset form
        formRef.current?.reset();
        const amtHidden = formRef.current?.querySelector<HTMLInputElement>("#amount");
        if (amtHidden) amtHidden.value = "";
      }
    };
    iframe.addEventListener("load", onLoad);
    return () => iframe.removeEventListener("load", onLoad);
  }, [submitted]);

  useEffect(() => {
    const ts = formRef.current?.querySelector<HTMLInputElement>("#ts");
    if (ts) ts.value = new Date().toISOString();
  }, []);

  function formatWithCommas(value: string) {
    if (value === "") return "";
    const parts = value.replace(/[^0-9.]/g, "").split(".");
    const intPart = parts[0].replace(/^0+(?=\d)/, "");
    const decPart = parts[1] ? parts[1].slice(0, 2) : undefined;
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decPart !== undefined ? withCommas + "." + decPart : withCommas;
  }

  function syncAmount(e: React.FormEvent<HTMLInputElement>) {
    const display = e.currentTarget;
    const prev = display.value;
    const formatted = formatWithCommas(prev);
    display.value = formatted;
    const hidden = formRef.current?.querySelector<HTMLInputElement>("#amount");
    if (hidden) hidden.value = formatted.replace(/,/g, "");
  }

  function validateStep1() {
    const f = formRef.current!;
    const hasHome = !!f.querySelector<HTMLInputElement>(
      'input[name="homeowner_ontario"]:checked'
    );
    const hasNeed = !!f.querySelector<HTMLInputElement>(
      'input[name="need_help"]:checked'
    );
    const amt = (f.querySelector<HTMLInputElement>("#amount")?.value || "").trim();
    return hasHome && hasNeed && amt !== "" && !isNaN(Number(amt));
  }

  function goToStep(n: number) {
    const s1 = formRef.current?.querySelector<HTMLDivElement>("#step1");
    const s2 = formRef.current?.querySelector<HTMLDivElement>("#step2");
    if (n === 1) {
      if (s1) s1.style.display = "grid";
      if (s2) s2.style.display = "none";
    } else {
      if (s1) s1.style.display = "none";
      if (s2) s2.style.display = "grid";
    }
    const pills = formRef.current?.querySelectorAll<HTMLSpanElement>(".pill");
    pills?.forEach((p) => p.classList.toggle("active", p.dataset.step === String(n)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onNext() {
    if (validateStep1()) {
      goToStep(2);
      setStatus("");
    } else {
      setStatus("Please complete all required fields on Step 1.");
    }
  }

  function onBack() {
    goToStep(1);
  }

  function onSubmit(e: React.FormEvent) {
    const f = formRef.current!;
    const a = (f.elements.namedItem("phone_area") as HTMLInputElement)?.value.replace(/\D/g, "");
    const b = (f.elements.namedItem("phone_prefix") as HTMLInputElement)?.value.replace(/\D/g, "");
    const c = (f.elements.namedItem("phone_line") as HTMLInputElement)?.value.replace(/\D/g, "");
    const phoneFull = f.querySelector<HTMLInputElement>("#phone_full");
    if (phoneFull) phoneFull.value = a && b && c ? `(${a}) ${b}-${c}` : "";
    const ts = f.querySelector<HTMLInputElement>("#ts");
    if (ts) ts.value = new Date().toISOString();

    if (!f.checkValidity() || !validateStep1()) {
      e.preventDefault();
      setStatus("Please fill all required contact details.");
      return;
    }
    setStatus("Sending…");
    setSubmitted(true);
    // allow normal form submit (targeted to hidden iframe)
  }

  return (
    <div className={styles.wrap}>
      <h1>Secure Your Approval</h1>
      <div className={styles.progress} id="progress">
        <span className={`${styles.pill} active`} data-step={1 as any}>
          1
        </span>
        <span className={styles.chev} aria-hidden="true"></span>
        <span className={styles.pill} data-step={2 as any}>
          2
        </span>
      </div>

      <iframe name="hidden_iframe" id="hidden_iframe" className={styles.sr} ref={iframeRef} />

      <form
        ref={formRef}
        className={styles.card + " " + styles.grid}
        action="https://hooks.zapier.com/hooks/catch/20742109/u67siz4/"
        method="post"
        target="hidden_iframe"
        acceptCharset="UTF-8"
        noValidate
        onSubmit={onSubmit}
      >
        <section id="step1" aria-labelledby="s1-title" className={styles.grid}>
          <div className={styles.row}>
            <label id="s1-title">
              Are you a homeowner in Ontario? <span className={styles.error}>*</span>
            </label>
            <div className={styles.choices}>
              <label className={styles["radio-card"]}>
                <input type="radio" name="homeowner_ontario" value="Yes" required /> <span>Yes - check my options!</span>
              </label>
              <label className={styles["radio-card"]}>
                <input type="radio" name="homeowner_ontario" value="No" required /> <span>No</span>
              </label>
            </div>
          </div>

          <div className={styles.row}>
            <label>
              What do you need help with most right now? <span className={styles.error}>*</span>
            </label>
            <div className={styles.choices}>
              <label className={styles["radio-card"]}><input type="radio" name="need_help" value="Consolidate Debt" required /> <span>Consolidate Debt</span></label>
              <label className={styles["radio-card"]}><input type="radio" name="need_help" value="Home Equity Line of Credit" required /> <span>Home Equity Line of Credit</span></label>
              <label className={styles["radio-card"]}><input type="radio" name="need_help" value="Home Equity Loan" required /> <span>Home Equity Loan</span></label>
              <label className={styles["radio-card"]}><input type="radio" name="need_help" value="Refinance" required /> <span>Refinance</span></label>
              <label className={styles["radio-card"]}><input type="radio" name="need_help" value="Renewal" required /> <span>Renewal</span></label>
              <label className={styles["radio-card"]}><input type="radio" name="need_help" value="Reverse Mortgage" required /> <span>Reverse Mortgage</span></label>
            </div>
          </div>

          <div className={styles.row}>
            <label>
              What's the amount you have in mind? <span className={styles.error}>*</span>
            </label>
            <span className={styles.hint}>An estimate is fine — we’ll work out the details together</span>
            <div className={styles.money}>
              <span className={styles.prefix}>$</span>
              <input type="text" name="amount_display" id="amount_display" placeholder="0" inputMode="decimal" autoComplete="off" required onInput={syncAmount} />
              <input type="hidden" name="amount" id="amount" />
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" id="nextBtn" onClick={onNext}>
              Next
            </button>
          </div>
        </section>

        <section id="step2" aria-labelledby="s2-title" className={styles.grid} style={{ display: "none" }}>
          <div className={styles.row}>
            <label id="s2-title">Name <span className={styles.error}>*</span></label>
            <div className={styles.inline}>
              <input type="text" name="first_name" placeholder="John" required />
              <input type="text" name="last_name" placeholder="MacDonald" required />
            </div>
          </div>

          <div className={styles.row}>
            <label>Email <span className={styles.error}>*</span></label>
            <input type="email" name="email" placeholder="home@owner.ca" required />
            <span className={styles.hint}>Provide an email address you check frequently.</span>
          </div>

          <div className={styles.row}>
            <label>Phone <span className={styles.error}>*</span></label>
            <span className={styles.hint}>Enter the best number to reach you.</span>
            <div className={styles.inline + " three"}>
              <input type="text" name="phone_area" maxLength={3} placeholder="###" required />
              <input type="text" name="phone_prefix" maxLength={3} placeholder="###" required />
              <input type="text" name="phone_line" maxLength={4} placeholder="####" required />
            </div>
            <button className="secondary" type="button" tabIndex={-1}>Include area code</button>
          </div>

          <input type="hidden" name="phone" id="phone_full" />
          <input type="hidden" name="submitted_via" value="multi_step_contact" />
          <input type="hidden" name="timestamp" id="ts" />

          <div className={styles.actions}>
            <button type="button" className="secondary" id="backBtn" onClick={onBack}>
              Back
            </button>
            <button type="submit" id="submitBtn">Submit</button>
          </div>
        </section>

        <p id="status" aria-live="polite">{status}</p>
      </form>
    </div>
  );
}

/* global AutoApplyDom */
const IcimsApply = (() => {
  const { sleep, fillAny, clickAny, fillByTextAny, uploadResumeFromProfile, clickByText } = AutoApplyDom;

  const ICIMS_SELECTORS = {
    firstName: ["input[name*='FirstName']", "input[id*='FirstName']", "#FirstName"],
    lastName: ["input[name*='LastName']", "input[id*='LastName']", "#LastName"],
    email: ["input[name*='Email']", "input[id*='Email']", "input[type='email']"],
    phoneNumber: ["input[name*='Phone']", "input[id*='Phone']"],
    street: ["input[name*='Address']", "input[id*='Address1']"],
    city: ["input[name*='City']", "input[id*='City']"],
    postalCode: ["input[name*='Zip']", "input[name*='Postal']"],
    linkedInLink: ["input[name*='LinkedIn']", "input[id*='LinkedIn']"]
  };

  function fillIcimsNamedFields(profile) {
    for (const root of AutoApplyDom.getRoots()) {
      for (const [key, selectors] of Object.entries(ICIMS_SELECTORS)) {
        if (!profile[key]) continue;
        for (const sel of selectors) {
          const el = root.querySelector(sel);
          if (!el) continue;
          const proto = Object.getPrototypeOf(el);
          const desc = Object.getOwnPropertyDescriptor(proto, "value");
          if (desc?.set) desc.set.call(el, profile[key]);
          else el.value = profile[key];
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
          break;
        }
      }
    }
  }

  async function openApplication(log) {
    const clicked =
      clickAny("#icims_apply_button, a.icims_apply, a[id*='apply'], button[id*='apply']") ||
      clickByText([/apply for this job/i, /apply now/i, /^apply$/i, /submit application/i]) ||
      clickAny("a[href*='apply'], a[href*='Apply']");

    if (clicked) {
      log("iCIMS: opened application flow.");
      await sleep(1200);
    }
    return clicked;
  }

  async function fillPage(profile) {
    fillIcimsNamedFields(profile);
    fillByTextAny(["first name", "given name"], profile.firstName);
    fillByTextAny(["last name", "family name"], profile.lastName);
    fillByTextAny("email", profile.email);
    fillByTextAny("phone", profile.phoneNumber);
    fillByTextAny(["address", "street"], profile.street);
    fillByTextAny("city", profile.city);
    fillByTextAny(["state", "region"], profile.state);
    fillByTextAny(["zip", "postal"], profile.postalCode);
    fillByTextAny("linkedin", profile.linkedInLink);
    fillByTextAny("github", profile.githubLink);
    fillByTextAny(["portfolio", "website"], profile.portfolioLink || profile.linkedInLink);
    fillByTextAny(["school", "university"], profile.school);
    fillByTextAny(["degree"], profile.degree);
    fillByTextAny(["field of study", "major"], profile.fieldOfStudy);
    fillByTextAny(["gpa"], profile.gpa);
    fillByTextAny(["authorized", "work authorization"], profile.workAuthorization);
    fillByTextAny(["sponsorship", "visa"], profile.sponsorshipRequired);

    for (const work of profile.workexperiences || []) {
      fillByTextAny(["job title", "position title"], work.jobtitle);
      fillByTextAny(["company", "employer"], work.company);
      fillByTextAny(["description", "responsibilities"], work.description);
    }

    for (const skill of profile.skills || []) {
      fillByTextAny(["skills", "skill"], skill);
    }

    uploadResumeFromProfile(profile);
  }

  async function maybeSubmit(profile, log) {
    if (!profile.autoSubmit) return false;
    const ok =
      clickAny("input[type='submit'], button[type='submit']") ||
      clickByText([/submit application/i, /submit$/i]);
    if (ok) log("iCIMS: submitted.");
    return ok;
  }

  async function apply(profile, log = () => {}) {
    log("iCIMS: guest apply (no sign-in).");
    await openApplication(log);

    for (let step = 0; step < 10; step++) {
      await sleep(900);
      log(`Step ${step + 1}`);
      await fillPage(profile);

      if (await maybeSubmit(profile, log)) {
        return { status: "submitted", platform: "icims" };
      }

      const next =
        clickByText([/^next$/i, /continue/i, /save and continue/i]) ||
        clickAny("input[name*='next'], button[name*='next'], a.next");

      if (next) {
        await sleep(1000);
        continue;
      }

      if (step === 0) {
        log("Fill in progress — use Next/Continue on the site if present.");
      }
    }

    return { status: "needs_review", platform: "icims" };
  }

  return { apply };
})();

/* global AutoApplyDom */
const WorkdayApply = (() => {
  const { sleep, fillAny, fillFirst, clickAny, exists, chooseDropdown, fillByTextAny, uploadResumeFromProfile } =
    AutoApplyDom;

  const NEXT = 'button[data-automation-id="bottom-navigation-next-button"]';

  async function startApplication(log) {
    if (exists('a[data-automation-id="adventureButton"]')) {
      clickAny('a[data-automation-id="adventureButton"]');
      await sleep(700);
      clickAny('a[data-automation-id="adventureButton"]');
      await sleep(700);
    }
    if (clickAny('a[data-automation-id="applyManually"]')) {
      log("Clicked Apply manually.");
      await sleep(800);
      return true;
    }
    if (clickAny('a[data-automation-id="jobPostingApplyButton"]')) {
      log("Clicked Apply.");
      await sleep(800);
    }
    return false;
  }

  async function fillContact(profile) {
    fillFirst(
      [
        "#name--legalName--firstName",
        'input[name="legalName--firstName"]',
        '[data-automation-id="formField-legalName--firstName"] input',
        'input[data-automation-id="legalNameSection_firstName"]'
      ],
      profile.firstName
    );

    fillFirst(
      [
        "#name--legalName--lastName",
        'input[name="legalName--lastName"]',
        '[data-automation-id="formField-legalName--lastName"] input',
        'input[data-automation-id="legalNameSection_lastName"]'
      ],
      profile.lastName
    );

    chooseDropdown('button[data-automation-id="legalNameSection_social"]', profile.suffix);

    fillFirst(
      [
        "#address--addressLine1",
        'input[name="addressLine1"]',
        '[data-automation-id="formField-addressLine1"] input',
        'input[data-automation-id="addressSection_addressLine1"]'
      ],
      profile.street
    );

    fillFirst(
      [
        "#address--city",
        'input[name="city"]',
        '[data-automation-id="formField-city"] input',
        'input[data-automation-id="addressSection_city"]'
      ],
      profile.city
    );

    chooseDropdown('button[data-automation-id="addressSection_countryRegion"]', profile.state);

    fillFirst(
      [
        "#address--postalCode",
        'input[name="postalCode"]',
        '[data-automation-id="formField-postalCode"] input',
        'input[data-automation-id="addressSection_postalCode"]'
      ],
      profile.postalCode
    );

    chooseDropdown('button[data-automation-id="phone-device-type"]', profile.phoneType);

    fillFirst(
      [
        "#phoneNumber--phoneNumber",
        'input[name="phoneNumber"]',
        '[data-automation-id="formField-phoneNumber"] input',
        'input[data-automation-id="phone-number"]'
      ],
      profile.phoneNumber
    );

    fillByTextAny(["first name", "given name"], profile.firstName);
    fillByTextAny(["last name", "family name"], profile.lastName);
    fillByTextAny("email", profile.email);
    fillByTextAny(["address line 1", "street"], profile.street);
    fillByTextAny("city", profile.city);
    fillByTextAny(["postal code", "zip"], profile.postalCode);
    fillByTextAny(["phone number", "phone"], profile.phoneNumber);
  }

  async function fillExperience(profile) {
    let index = 1;
    for (const work of profile.workexperiences || []) {
      const sectionSel = `div[data-automation-id="workExperience-${index}"]`;
      if (!exists(sectionSel)) {
        clickAny('div[data-automation-id="workExperienceSection"] button[data-automation-id*="Add"]') ||
          clickAny('div[data-automation-id="workExperienceSection"] button[data-automation-id*="add"]');
        await sleep(500);
      }
      fillAny(`${sectionSel} input[data-automation-id="jobTitle"]`, work.jobtitle);
      fillAny(`${sectionSel} input[data-automation-id="company"]`, work.company);
      fillAny(`${sectionSel} input[data-automation-id="location"]`, work.location);
      fillAny(
        `${sectionSel} div[data-automation-id="formField-startDate"] input[data-automation-id="dateSectionMonth-input"]`,
        work.startDateMonth
      );
      fillAny(
        `${sectionSel} div[data-automation-id="formField-startDate"] input[data-automation-id="dateSectionYear-input"]`,
        work.startDateYear
      );
      fillAny(
        `${sectionSel} div[data-automation-id="formField-endDate"] input[data-automation-id="dateSectionMonth-input"]`,
        work.endDateMonth
      );
      fillAny(
        `${sectionSel} div[data-automation-id="formField-endDate"] input[data-automation-id="dateSectionYear-input"]`,
        work.endDateYear
      );
      fillAny(`${sectionSel} textarea[data-automation-id="description"]`, work.description);
      index++;
    }
  }

  async function fillEducation(profile) {
    clickAny('div[data-automation-id="educationSection"] button[data-automation-id="Add"]');
    await sleep(400);
    fillByTextAny(["school", "university", "institution"], profile.school);
    chooseDropdown('button[data-automation-id="degree"]', profile.degree);
    fillByTextAny(["field of study", "major"], profile.fieldOfStudy);
    fillAny('input[data-automation-id="gpa"]', profile.gpa);
    fillByTextAny(["first year", "start year"], profile.educationStartYear);
    fillByTextAny(["last year", "end year"], profile.educationEndYear);
  }

  async function fillLinksAndSkills(profile) {
    fillAny('input[data-automation-id="linkedinQuestion"]', profile.linkedInLink);
    fillByTextAny("linkedin", profile.linkedInLink);
    fillByTextAny("github", profile.githubLink);
    fillByTextAny(["portfolio", "website"], profile.portfolioLink || profile.linkedInLink);
    for (const skill of profile.skills || []) {
      if (fillByTextAny(["skills", "skill"], skill)) {
        document.activeElement?.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
        );
        await sleep(200);
      }
    }
  }

  async function fillDisclosures(profile) {
    chooseDropdown('button[data-automation-id="gender"]', profile.gender);
    chooseDropdown('button[data-automation-id="hispanicOrLatino"]', profile.hispanicOrLatino);
    chooseDropdown('button[data-automation-id="ethnicityDropdown"]', profile.ethnicity);
    chooseDropdown('button[data-automation-id="veteranStatus"]', profile.veteranStatus);
    clickAny('input[data-automation-id="agreementCheckbox"]');
    fillAny('input[data-automation-id="name"]', profile.fullName);
    fillByTextAny(["authorized", "work authorization"], profile.workAuthorization);
    fillByTextAny(["sponsorship", "visa"], profile.sponsorshipRequired);
  }

  async function fillCurrentPage(profile) {
    await fillContact(profile);
    await fillExperience(profile);
    await fillEducation(profile);
    await fillLinksAndSkills(profile);
    await fillDisclosures(profile);
    uploadResumeFromProfile(profile);
  }

  async function maybeSubmit(profile, log) {
    const selectors = [
      'button[data-automation-id="bottom-navigation-submit-button"]',
      'button[data-automation-id*="submit"]'
    ];
    for (const sel of selectors) {
      if (!exists(sel)) continue;
      if (!profile.autoSubmit) {
        log("Submit found — auto-submit OFF. Review and submit manually.");
        return false;
      }
      clickAny(sel);
      log("Submitted application.");
      return true;
    }
    return false;
  }

  async function apply(profile, log = () => {}) {
    log("Workday: guest apply (no sign-in).");
    await startApplication(log);

    for (let step = 0; step < 14; step++) {
      await sleep(1100);
      log(`Step ${step + 1}: ${document.title || "Workday"}`);
      await fillCurrentPage(profile);

      if (await maybeSubmit(profile, log)) {
        return { status: "submitted", platform: "workday" };
      }

      if (clickAny(NEXT)) {
        await sleep(900);
        continue;
      }

      log("No Next button — review this page manually.");
      return { status: "needs_review", platform: "workday" };
    }

    return { status: "max_steps_reached", platform: "workday" };
  }

  return { apply };
})();

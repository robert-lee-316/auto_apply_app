/* global AutoApplyDom */
const WorkdayApply = (() => {
  const {
    sleep,
    fillAny,
    fillFirst,
    clickAny,
    exists,
    chooseDropdown,
    choosePromptSearch,
    chooseRadio,
    fillInput,
    fillByTextAny,
    checkAny,
    uploadResumeFromProfile
  } = AutoApplyDom;

  const PHONE_NUMBER_INPUT = [
    "#phoneNumber--phoneNumber",
    'input#phoneNumber--phoneNumber[name="phoneNumber"]',
    '[data-automation-id="formField-phoneNumber"] input[type="text"][name="phoneNumber"]'
  ];

  function phoneNumberValues(profile) {
    const raw = (profile.phoneNumber || "").trim();
    if (!raw) return [];
    const digits = raw.replace(/\D/g, "");
    return [...new Set([raw, digits].filter(Boolean))];
  }

  async function fillPhoneNumber(profile) {
    const values = phoneNumberValues(profile);
    if (!values.length) return false;
    return fillInput(PHONE_NUMBER_INPUT, values);
  }

  const NEXT = 'button[data-automation-id="bottom-navigation-next-button"]';

  const PHONE_TYPE_BUTTONS = [
    "#phoneNumber--phoneType",
    'button[name="phoneType"]',
    '[data-automation-id="formField-phoneType"] button[aria-haspopup="listbox"]',
    'button[data-automation-id="phone-device-type"]'
  ];

  const STATE_BUTTONS = [
    "#address--countryRegion",
    'button[name="countryRegion"]',
    '[data-automation-id="formField-countryRegion"] button[aria-haspopup="listbox"]',
    'button[data-automation-id="addressSection_countryRegion"]'
  ];

  const US_STATE_NAMES = {
    AL: "Alabama",
    AK: "Alaska",
    AZ: "Arizona",
    AR: "Arkansas",
    CA: "California",
    CO: "Colorado",
    CT: "Connecticut",
    DE: "Delaware",
    FL: "Florida",
    GA: "Georgia",
    HI: "Hawaii",
    ID: "Idaho",
    IL: "Illinois",
    IN: "Indiana",
    IA: "Iowa",
    KS: "Kansas",
    KY: "Kentucky",
    LA: "Louisiana",
    ME: "Maine",
    MD: "Maryland",
    MA: "Massachusetts",
    MI: "Michigan",
    MN: "Minnesota",
    MS: "Mississippi",
    MO: "Missouri",
    MT: "Montana",
    NE: "Nebraska",
    NV: "Nevada",
    NH: "New Hampshire",
    NJ: "New Jersey",
    NM: "New Mexico",
    NY: "New York",
    NC: "North Carolina",
    ND: "North Dakota",
    OH: "Ohio",
    OK: "Oklahoma",
    OR: "Oregon",
    PA: "Pennsylvania",
    RI: "Rhode Island",
    SC: "South Carolina",
    SD: "South Dakota",
    TN: "Tennessee",
    TX: "Texas",
    UT: "Utah",
    VT: "Vermont",
    VA: "Virginia",
    WA: "Washington",
    WV: "West Virginia",
    WI: "Wisconsin",
    WY: "Wyoming",
    DC: "District of Columbia"
  };

  function phoneTypeValues(profile) {
    const primary = (profile.phoneType || "Cell").trim();
    const aliases = {
      mobile: ["Mobile", "Cell", "Phone", "Cellular"],
      cell: ["Cell", "Mobile", "Phone", "Cellular"],
      phone: ["Phone", "Cell", "Landline"],
      cellular: ["Cellular", "Cell", "Mobile"]
    };
    return [...new Set([primary, ...(aliases[primary.toLowerCase()] || [])])];
  }

  function stateValues(profile) {
    const primary = (profile.state || "").trim();
    if (!primary) return [];
    const values = [primary];
    if (primary.length === 2) {
      const full = US_STATE_NAMES[primary.toUpperCase()];
      if (full) values.unshift(full);
    } else {
      const abbr = Object.entries(US_STATE_NAMES).find(
        ([, name]) => name.toLowerCase() === primary.toLowerCase()
      )?.[0];
      if (abbr) values.push(abbr);
    }
    return [...new Set(values)];
  }

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

    await chooseDropdown(STATE_BUTTONS, stateValues(profile));

    fillFirst(
      [
        "#address--postalCode",
        'input[name="postalCode"]',
        '[data-automation-id="formField-postalCode"] input',
        'input[data-automation-id="addressSection_postalCode"]'
      ],
      profile.postalCode
    );

    await choosePromptSearch(
      [
        "#phoneNumber--countryPhoneCode",
        '[data-automation-id="formField-countryPhoneCode"] input[data-uxi-widget-type="selectinput"]'
      ],
      ["United states", "United States", "USA", profile.country].filter(Boolean),
      { labelKeywords: ["country / territory phone code", "phone code"] }
    );

    await chooseDropdown(PHONE_TYPE_BUTTONS, phoneTypeValues(profile));

    await fillPhoneNumber(profile);
    checkAny('input[data-automation-id="phone-sms-opt-in"]');

    fillByTextAny(["first name", "given name"], profile.firstName);
    fillByTextAny(["last name", "family name"], profile.lastName);
    fillByTextAny("email", profile.email);
    fillByTextAny(["address line 1", "street"], profile.street);
    fillByTextAny("city", profile.city);
    fillByTextAny(["postal code", "zip"], profile.postalCode);

    await choosePromptSearch(
      [
        "#source--source",
        '[data-automation-id="formField-source"] input[data-automation-id="searchBox"]',
        '[data-automation-id="formField-source"] input[data-uxi-widget-type="selectinput"]'
      ],
      profile.applicationSource || "linkedin",
      { labelKeywords: ["how did you hear", "hear about us"] }
    );

    await fillPhoneNumber(profile);
    checkAny('input[data-automation-id="phone-sms-opt-in"]');
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

  function fillPreviousWorker() {
    chooseRadio({ name: "candidateIsPreviousWorker", value: "false" });
    chooseRadio({
      legendKeywords: ["previously been employed", "previous worker"],
      labelText: "No"
    });
    clickAny('input[name="candidateIsPreviousWorker"][value="false"]');
    clickAny(
      '[data-automation-id="formField-candidateIsPreviousWorker"] input[type="radio"][value="false"]'
    );
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
    fillPreviousWorker();
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

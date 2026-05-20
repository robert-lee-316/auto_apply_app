import { fill, click, chooseDropdown, selectorExists, sleep, uploadFile, fillByText } from "./utils.js";

const nextButton = 'button[data-automation-id="bottom-navigation-next-button"]';

export function isWorkday(url) {
  return url.includes("myworkdayjobs.com") || url.includes("workdayjobs.com");
}

export async function applyWorkday(page, profile, log = console.log) {
  log("Detected Workday");
  await signInOrCreate(page, profile, log);
  await startApplication(page, log);

  for (let i = 0; i < 12; i++) {
    await sleep(1200);
    const title = await page.title().catch(() => "");
    log(`Step ${i + 1}: ${title}`);

    await fillCurrentWorkdayPage(page, profile, log);

    const submitted = await maybeSubmit(page, profile, log);
    if (submitted) return { status: "submitted" };

    const moved = await click(page, nextButton, 3000);
    if (!moved) {
      log("No Next button found. Manual review may be needed.");
      return { status: "needs_review" };
    }
  }

  return { status: "max_steps_reached" };
}

async function signInOrCreate(page, profile, log) {
  if (!(await selectorExists(page, 'button[data-automation-id="utilityButtonSignIn"]', 3000))) return;

  await click(page, 'button[data-automation-id="utilityButtonSignIn"]');
  await fill(page, 'input[data-automation-id="email"]', profile.email);
  await fill(page, 'input[data-automation-id="password"]', profile.password);
  await click(page, 'button[data-automation-id="signInSubmitButton"]');
  await sleep(1500);

  if (await selectorExists(page, 'div[data-automation-id="errorMessage"]', 2500)) {
    log("Account not found. Creating account.");
    await click(page, 'button[data-automation-id="createAccountLink"]');
    await fill(page, 'input[data-automation-id="email"]', profile.email);
    await fill(page, 'input[data-automation-id="password"]', profile.password);
    await fill(page, 'input[data-automation-id="verifyPassword"]', profile.password);
    await click(page, 'input[data-automation-id="createAccountCheckbox"]');
    await click(page, 'button[data-automation-id="createAccountSubmitButton"]');
    await sleep(1500);
  }
}

async function startApplication(page, log) {
  if (await selectorExists(page, 'a[data-automation-id="adventureButton"]', 5000)) {
    await click(page, 'a[data-automation-id="adventureButton"]');
    await sleep(700);
    await click(page, 'a[data-automation-id="adventureButton"]');
    await sleep(700);
  }
  await click(page, 'a[data-automation-id="applyManually"]', 5000);
}

async function fillCurrentWorkdayPage(page, profile, log) {
  await fillContact(page, profile);
  await fillExperience(page, profile);
  await fillEducation(page, profile);
  await fillLinksAndSkills(page, profile);
  await fillDisclosures(page, profile);
  await uploadFile(page, 'input[data-automation-id="file-upload-input-ref"]', profile.resumeFilePath);
}

async function fillContact(page, profile) {
  await fill(page, 'input[data-automation-id="legalNameSection_firstName"]', profile.firstName);
  await fill(page, 'input[data-automation-id="legalNameSection_lastName"]', profile.lastName);
  await chooseDropdown(page, 'button[data-automation-id="legalNameSection_social"]', profile.suffix);
  await fill(page, 'input[data-automation-id="addressSection_addressLine1"]', profile.street);
  await fill(page, 'input[data-automation-id="addressSection_city"]', profile.city);
  await chooseDropdown(page, 'button[data-automation-id="addressSection_countryRegion"]', profile.state);
  await fill(page, 'input[data-automation-id="addressSection_postalCode"]', profile.postalCode);
  await chooseDropdown(page, 'button[data-automation-id="phone-device-type"]', profile.phoneType);
  await fill(page, 'input[data-automation-id="phone-number"]', profile.phoneNumber);
  await fillByText(page, ["first name", "given name"], profile.firstName);
  await fillByText(page, ["last name", "family name"], profile.lastName);
  await fillByText(page, "email", profile.email);
  await fillByText(page, "phone", profile.phoneNumber);
}

async function fillExperience(page, profile) {
  let index = 1;
  for (const work of profile.workexperiences || []) {
    const section = `div[data-automation-id="workExperience-${index}"]`;
    if (!(await selectorExists(page, section, 800))) {
      await click(page, 'div[data-automation-id="workExperienceSection"] button[data-automation-id*="Add"]', 1000) ||
      await click(page, 'div[data-automation-id="workExperienceSection"] button[data-automation-id*="add"]', 1000);
      await sleep(500);
    }
    await fill(page, `${section} input[data-automation-id="jobTitle"]`, work.jobtitle);
    await fill(page, `${section} input[data-automation-id="company"]`, work.company);
    await fill(page, `${section} input[data-automation-id="location"]`, work.location);
    await fill(page, `${section} div[data-automation-id="formField-startDate"] input[data-automation-id="dateSectionMonth-input"]`, work.startDateMonth);
    await fill(page, `${section} div[data-automation-id="formField-startDate"] input[data-automation-id="dateSectionYear-input"]`, work.startDateYear);
    await fill(page, `${section} div[data-automation-id="formField-endDate"] input[data-automation-id="dateSectionMonth-input"]`, work.endDateMonth);
    await fill(page, `${section} div[data-automation-id="formField-endDate"] input[data-automation-id="dateSectionYear-input"]`, work.endDateYear);
    await fill(page, `${section} textarea[data-automation-id="description"]`, work.description);
    index++;
  }
}

async function fillEducation(page, profile) {
  await click(page, 'div[data-automation-id="educationSection"] button[data-automation-id="Add"]', 1000);
  await fillByText(page, ["school", "university", "institution"], profile.school);
  await chooseDropdown(page, 'button[data-automation-id="degree"]', profile.degree);
  await fillByText(page, ["field of study", "major"], profile.fieldOfStudy);
  await fill(page, 'input[data-automation-id="gpa"]', profile.gpa);
  await fillByText(page, ["first year", "start year"], profile.educationStartYear);
  await fillByText(page, ["last year", "end year"], profile.educationEndYear);
}

async function fillLinksAndSkills(page, profile) {
  await fill(page, 'input[data-automation-id="linkedinQuestion"]', profile.linkedInLink);
  await fillByText(page, "linkedin", profile.linkedInLink);
  await fillByText(page, "github", profile.githubLink);
  await fillByText(page, ["portfolio", "website"], profile.portfolioLink || profile.linkedInLink);
  for (const skill of profile.skills || []) {
    const ok = await fillByText(page, ["skills", "skill"], skill);
    if (ok) await page.keyboard.press("Enter").catch(() => {});
  }
}

async function fillDisclosures(page, profile) {
  await chooseDropdown(page, 'button[data-automation-id="gender"]', profile.gender);
  await chooseDropdown(page, 'button[data-automation-id="hispanicOrLatino"]', profile.hispanicOrLatino);
  await chooseDropdown(page, 'button[data-automation-id="ethnicityDropdown"]', profile.ethnicity);
  await chooseDropdown(page, 'button[data-automation-id="veteranStatus"]', profile.veteranStatus);
  await click(page, 'input[data-automation-id="agreementCheckbox"]', 1000);
  await fill(page, 'input[data-automation-id="name"]', profile.fullName);
}

async function maybeSubmit(page, profile, log) {
  const submitSelectors = [
    'button[data-automation-id="bottom-navigation-submit-button"]',
    'button[data-automation-id*="submit"]'
  ];

  for (const selector of submitSelectors) {
    if (await selectorExists(page, selector, 1000)) {
      if (!profile.autoSubmit) {
        log("Submit button found. Auto-submit is OFF. Please review manually.");
        return false;
      }
      await click(page, selector);
      log("Application submitted.");
      return true;
    }
  }
  return false;
}

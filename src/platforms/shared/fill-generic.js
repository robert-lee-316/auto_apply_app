import { fillByText, uploadFile } from "../../utils.js";

export async function fillGenericForm(page, profile, log = console.log) {
  log("Filling application fields (guest apply — no sign-in)");

  await fillByText(page, ["first name", "given name"], profile.firstName);
  await fillByText(page, ["last name", "family name"], profile.lastName);
  await fillByText(page, "full name", profile.fullName);
  await fillByText(page, "email", profile.email);
  await fillByText(page, "phone", profile.phoneNumber);
  await fillByText(page, ["address", "street"], profile.street);
  await fillByText(page, "city", profile.city);
  await fillByText(page, ["state", "region"], profile.state);
  await fillByText(page, ["zip", "postal"], profile.postalCode);
  await fillByText(page, "country", profile.country);
  await fillByText(page, "linkedin", profile.linkedInLink);
  await fillByText(page, "github", profile.githubLink);
  await fillByText(page, ["portfolio", "website"], profile.portfolioLink || profile.linkedInLink);
  await fillByText(page, ["school", "university"], profile.school);
  await fillByText(page, ["degree"], profile.degree);
  await fillByText(page, ["field of study", "major"], profile.fieldOfStudy);
  await fillByText(page, ["gpa"], profile.gpa);
  await fillByText(page, ["authorized", "work authorization"], profile.workAuthorization);
  await fillByText(page, ["sponsorship", "visa"], profile.sponsorshipRequired);

  for (const skill of profile.skills || []) {
    const ok = await fillByText(page, ["skills", "skill"], skill);
    if (ok) await page.keyboard.press("Enter").catch(() => {});
  }

  await uploadFile(page, 'input[type="file"]', profile.resumeFilePath);

  if (!profile.autoSubmit) {
    log("Auto-submit is OFF. Review the browser tab and submit manually.");
  }

  return { status: "filled_review_needed" };
}

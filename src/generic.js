import { fillByText, uploadFile } from "./utils.js";

export async function applyGeneric(page, profile, log = console.log) {
  log("Using generic ATS filler");
  await fillByText(page, ["first name", "given name"], profile.firstName);
  await fillByText(page, ["last name", "family name"], profile.lastName);
  await fillByText(page, "full name", profile.fullName);
  await fillByText(page, "email", profile.email);
  await fillByText(page, "phone", profile.phoneNumber);
  await fillByText(page, ["address", "street"], profile.street);
  await fillByText(page, "city", profile.city);
  await fillByText(page, "state", profile.state);
  await fillByText(page, ["zip", "postal"], profile.postalCode);
  await fillByText(page, "linkedin", profile.linkedInLink);
  await fillByText(page, "github", profile.githubLink);
  await fillByText(page, ["portfolio", "website"], profile.portfolioLink || profile.linkedInLink);
  await uploadFile(page, 'input[type="file"]', profile.resumeFilePath);
  return { status: "filled_review_needed" };
}

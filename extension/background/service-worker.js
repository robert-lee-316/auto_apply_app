chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});

  chrome.storage.local.get("profile", (data) => {
    if (data.profile) return;
    chrome.storage.local.set({
      profile: {
        email: "",
        fullName: "",
        firstName: "",
        lastName: "",
        suffix: "",
        street: "",
        city: "",
        state: "",
        country: "United States",
        postalCode: "",
        phoneType: "Cell",
        phoneNumber: "",
        school: "",
        degree: "",
        fieldOfStudy: "",
        gpa: "",
        skills: [],
        educationStartYear: "",
        educationEndYear: "",
        applicationSource: "linkedin",
        linkedInLink: "",
        githubLink: "",
        portfolioLink: "",
        workAuthorization: "Yes",
        sponsorshipRequired: "No",
        gender: "",
        ethnicity: "",
        hispanicOrLatino: "",
        veteranStatus: "",
        disability: "",
        autoSubmit: false,
        workexperiences: [],
        resumeBase64: "",
        resumeFileName: ""
      }
    });
  });
});

/** Open side panel when user lands on Workday / iCIMS (optional auto-open). */
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (info.status !== "complete" || !tab.url) return;
  const u = tab.url.toLowerCase();
  const supported =
    u.includes("myworkdayjobs.com") ||
    u.includes("workdayjobs.com") ||
    (u.includes("workday.com") && u.includes("job")) ||
    u.includes("icims.com");
  if (!supported) return;
  try {
    await chrome.sidePanel.setOptions({ tabId, path: "sidepanel/sidepanel.html", enabled: true });
  } catch {
    /* older Chrome */
  }
});

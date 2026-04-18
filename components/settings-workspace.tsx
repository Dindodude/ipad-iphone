"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAppState } from "@/components/app-state-provider";
import type { ActivityLog, AppSnapshot, Campaign, Category, Client, Lead, LeadStage, Script } from "@/lib/types";

function parseCSVLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        current += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function getCSVRowObject(headers: string[], values: string[]) {
  const row: Record<string, string> = {};
  headers.forEach((header, index) => {
    row[header] = values[index] || "";
  });
  return row;
}

function classifyText(input: string, categories: Category[]) {
  const lower = input.toLowerCase();
  const match = categories.find((category) => category.rules.some((rule) => lower.includes(rule.toLowerCase())));
  return match?.name ?? "Unmatched";
}

function titleCase(input: string) {
  return input
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function buildCategoryRules(name: string) {
  const normalized = name.toLowerCase();
  const tokens = normalized.split(/\s+/).filter(Boolean);
  return Array.from(new Set([normalized, ...tokens])).slice(0, 6);
}

function normalizeGeneratedCategory(rawValue: string) {
  const value = rawValue.trim().toLowerCase();
  if (!value) return "";

  const mappings: Array<[RegExp, string]> = [
    [/(dentist|dental|orthodont|hygien)/, "Dental"],
    [/(real estate|realtor|realty|broker|property|mortgage)/, "Real Estate"],
    [/(restaurant|bbq|breakfast|burger|cafe|coffee|food|grill|pizza|bar|bakery)/, "Restaurant"],
    [/(auto|mechanic|repair|garage|body shop)/, "Auto Repair"],
    [/(tire|wheel|alignment)/, "Tire Shop"],
    [/(detail|detailing|car wash|ceramic)/, "Car Detailing"],
    [/(lawyer|attorney|legal)/, "Legal"],
    [/(medspa|spa|salon|beauty|barber|hair|lashes|nail)/, "Beauty"],
    [/(physio|chiro|therapy|clinic|medical|doctor)/, "Health Clinic"],
    [/(gym|fitness|trainer|workout)/, "Fitness"],
    [/(roof|plumb|hvac|electric|contractor|renovation|flooring|painting)/, "Home Services"]
  ];

  const mapped = mappings.find(([pattern]) => pattern.test(value))?.[1];
  return mapped ?? titleCase(rawValue);
}

function getCategoryCandidates(row: Record<string, string>) {
  const directKeys = [
    "categoryname",
    "category_1",
    "category_2",
    "category_3",
    "category_4",
    "category_5",
    "category_6",
    "category_7",
    "category_8",
    "category_9",
    "category_10",
    "categories"
  ];

  const values = [
    ...directKeys.map((key) => row[key]),
    ...Object.keys(row)
      .filter((key) => /^categories\/\d+$/i.test(key))
      .sort()
      .map((key) => row[key])
  ]
    .flatMap((value) => (value || "").split(/[|/]/g))
    .map((value) => value.trim())
    .filter(Boolean);

  return Array.from(new Set(values));
}

function looksLikePhone(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits.length >= 10;
}

function getImportedPhone(row: Record<string, string>) {
  return row.phone || row.phoneunformatted || row.mobile || row.telephone || "";
}

function getImportedCity(row: Record<string, string>, phone: string) {
  const city = row.city || row.locality || row.neighborhood || "";
  if (!city) return "";
  if (!phone && looksLikePhone(city)) return "";
  return city;
}

function buildScriptsForCategory(category: string, clientId: string, campaignId: string) {
  const safeCategory = category || "General";
  const slug = safeCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const timestamp = new Date().toISOString();

  const scripts: Script[] = [
    {
      id: `script-${slug}-first-${Date.now()}`,
      clientId,
      campaignId,
      title: `${safeCategory} First Message`,
      type: "first-touch",
      content: `Hey {businessName}, I saw what you do in ${safeCategory.toLowerCase()} and had a quick idea to help bring in more qualified leads without making your follow-up messy. Want me to send it here?`,
      category: safeCategory,
      niche: safeCategory,
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      id: `script-${slug}-follow-${Date.now()}`,
      clientId,
      campaignId,
      title: `${safeCategory} Follow-Up`,
      type: "follow-up",
      content: `Quick follow-up in case this got buried. I still have a practical ${safeCategory.toLowerCase()} angle that could help {businessName} turn more interest into actual booked work.`,
      category: safeCategory,
      niche: safeCategory,
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      id: `script-${slug}-offer-${Date.now()}`,
      clientId,
      campaignId,
      title: `${safeCategory} Offer Builder`,
      type: "ai-generated",
      content: `LeadOS AI generated this ${safeCategory.toLowerCase()} offer starter: focus on WhatsApp-first follow-up, a simple niche-specific promise, and a fast next step that feels easy to say yes to.`,
      category: safeCategory,
      niche: safeCategory,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  ];

  return scripts;
}

const defaultStages: LeadStage[] = ["New", "Contacted", "Replied", "Interested", "Qualified", "Won", "Lost"];

export function SettingsWorkspace({ snapshot }: { snapshot: AppSnapshot }) {
  const { replaceSnapshot, resetAllInfo: persistResetAllInfo, updateCategories } = useAppState();
  const [categories, setCategories] = useState(snapshot.categories);
  const [backupMessage, setBackupMessage] = useState("Choose a backup file to validate it before wiring persistence.");
  const [csvInfo, setCsvInfo] = useState({
    fileName: "No CSV chosen yet",
    headers: [] as string[],
    rows: [] as string[][],
    sampleObjects: [] as Record<string, string>[],
    allObjects: [] as Record<string, string>[]
  });
  const [csvImportMessage, setCsvImportMessage] = useState("Choose a CSV file, then import it into LeadOS.");
  const [testText, setTestText] = useState("Mobile tire and alignment shop");
  const [newCategory, setNewCategory] = useState({ name: "", color: "#68aefc", rules: "" });
  const [aiPrefs, setAiPrefs] = useState({
    autoCreateCategories: true,
    autoCategorizeImportedLeads: true,
    autoGenerateLeadSummary: true,
    autoSuggestNextAction: true,
    preferredTone: "Direct and sharp",
    messageLength: "Short"
  });
  const [whatsAppSettings, setWhatsAppSettings] = useState({
    forceWhatsAppFirst: true,
    defaultStatus: "unknown",
    markNoWhatsAppAsLowPriority: true
  });
  const [leadStages, setLeadStages] = useState(defaultStages);
  const [formDefaults, setFormDefaults] = useState({
    defaultStage: "New",
    autoSummary: true,
    autoTagging: true,
    assignToSelectedCampaign: true
  });
  const [displayPrefs, setDisplayPrefs] = useState({
    density: "Compact",
    mobileMode: "Field Console",
    accent: "LeadOS Lime"
  });
  const [resetArmed, setResetArmed] = useState(false);

  const backupInputRef = useRef<HTMLInputElement | null>(null);
  const csvInputRef = useRef<HTMLInputElement | null>(null);
  const resetTimerRef = useRef<number | null>(null);

  const detectedCategory = useMemo(() => classifyText(testText, categories), [testText, categories]);
  const uniqueCsvCategories = useMemo(() => {
    const values = new Set<string>();
    csvInfo.sampleObjects.forEach((row) => {
      getCategoryCandidates(row).forEach((value) => {
        const normalized = normalizeGeneratedCategory(value);
        if (normalized) values.add(normalized);
      });
    });
    return Array.from(values);
  }, [csvInfo.sampleObjects]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setCategories(snapshot.categories);
  }, [snapshot.categories]);

  function exportBackup() {
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "leados-backup.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleBackupFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const parsed = JSON.parse(String(loadEvent.target?.result || "{}")) as AppSnapshot;
        replaceSnapshot(parsed);
        setBackupMessage(`Backup looks valid. Keys found: ${Object.keys(parsed).join(", ")}`);
      } catch {
        setBackupMessage("Backup file is not valid JSON.");
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  }

  function handleCsvFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const text = String(loadEvent.target?.result || "");
      const lines = text.split(/\r?\n/).filter((line) => line.trim());
      if (!lines.length) {
        setCsvInfo({ fileName: file.name, headers: [], rows: [], sampleObjects: [], allObjects: [] });
        setCsvImportMessage("That CSV was empty.");
        event.target.value = "";
        return;
      }
      const headers = parseCSVLine(lines[0]).map((item) => item.trim());
      const allRows = lines.slice(1).map((row) => parseCSVLine(row));
      const rows = allRows.slice(0, 5);
      const normalizedHeaders = headers.map((item) => item.toLowerCase());
      const sampleObjects = rows.map((row) =>
        getCSVRowObject(normalizedHeaders, row)
      );
      const allObjects = allRows.map((row) => getCSVRowObject(normalizedHeaders, row));
      setCsvInfo({
        fileName: file.name,
        headers,
        rows,
        sampleObjects,
        allObjects
      });
      setCsvImportMessage(`Loaded ${allObjects.length} CSV row${allObjects.length === 1 ? "" : "s"}. Ready to import into LeadOS.`);
      if (aiPrefs.autoCreateCategories) {
        const foundCategories = new Set<string>();
        allObjects.forEach((row) => {
          getCategoryCandidates(row).forEach((value) => {
            const normalized = normalizeGeneratedCategory(value);
            if (normalized) foundCategories.add(normalized);
          });
        });

        if (foundCategories.size) {
          const apply = (current: Category[]) => {
            const next = [...current];
            Array.from(foundCategories).forEach((name) => {
              if (!next.some((category) => category.name.toLowerCase() === name.toLowerCase())) {
                next.push({
                  id: `cat-auto-${Date.now()}-${name}`,
                  name,
                  color: "#b28cff",
                  rules: buildCategoryRules(name)
                });
              }
            });
            return next;
          };
          setCategories(apply);
          updateCategories(apply);
        }
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  }

  function runAiCategoryCreation() {
    if (!uniqueCsvCategories.length) return;
    const apply = (current: Category[]) => {
      const next = [...current];
      uniqueCsvCategories.forEach((name) => {
        if (!next.some((category) => category.name.toLowerCase() === name.toLowerCase())) {
          next.push({
            id: `cat-ai-${Date.now()}-${name}`,
            name,
            color: "#b28cff",
            rules: buildCategoryRules(name)
          });
        }
      });
      return next;
    };
    setCategories(apply);
    updateCategories(apply);
  }

  function runCsvCategorization() {
    if (!csvInfo.allObjects.length) {
      setCsvImportMessage("Choose a CSV file first so LeadOS can create and categorize the niches.");
      return;
    }

    const foundCategories = new Set<string>();
    csvInfo.allObjects.forEach((row) => {
      const derived = titleCase(
        normalizeGeneratedCategory(getCategoryCandidates(row)[0] || "")
        || classifyText(
          [
            row.title,
            row.name,
            row.categories?.replace(/\//g, " "),
            row.address,
            row.street,
            row.city,
            row.state,
            row.website
          ]
            .filter(Boolean)
            .join(" "),
          categories
        )
      );

      if (derived && derived !== "Unmatched") {
        foundCategories.add(derived);
      }
    });

    if (!foundCategories.size) {
      setCsvImportMessage("LeadOS could not derive any solid categories from that CSV yet.");
      return;
    }

    const apply = (current: Category[]) => {
      const next = [...current];
      Array.from(foundCategories).forEach((name) => {
        if (!next.some((category) => category.name.toLowerCase() === name.toLowerCase())) {
          next.push({
            id: `cat-run-${Date.now()}-${name}`,
            name,
            color: "#b28cff",
            rules: buildCategoryRules(name)
          });
        }
      });
      return next;
    };

    setCategories(apply);
    updateCategories(apply);
    setCsvImportMessage(`Created and categorized ${foundCategories.size} niche bucket${foundCategories.size === 1 ? "" : "s"} from the CSV.`);
  }

  function ensureImportContext(current: AppSnapshot) {
    const timestamp = new Date().toISOString();
    const nextClients = [...current.clients];
    const nextCampaigns = [...current.campaigns];

    let importClient = nextClients[0];
    if (!importClient) {
      importClient = {
        id: `client-import-${Date.now()}`,
        name: "Imported Leads",
        niche: "Mixed",
        contactPerson: "LeadOS Import",
        phone: "",
        email: "",
        notes: "Auto-created client workspace for settings CSV imports.",
        status: "active",
        createdAt: timestamp,
        updatedAt: timestamp
      };
      nextClients.push(importClient);
    }

    let importCampaign = nextCampaigns.find((campaign) => campaign.clientId === importClient.id);
    if (!importCampaign) {
      importCampaign = {
        id: `campaign-import-${Date.now()}`,
        clientId: importClient.id,
        name: "CSV Imports",
        source: "CSV Import",
        description: "Auto-created campaign for imported CSV leads.",
        nicheContext: importClient.niche || "Mixed imported leads",
        defaultStage: "New",
        status: "active",
        createdAt: timestamp,
        updatedAt: timestamp
      };
      nextCampaigns.push(importCampaign);
    }

    return { nextClients, nextCampaigns, importClient, importCampaign };
  }

  function importCsvIntoLeadOS() {
    if (!csvInfo.allObjects.length) {
      setCsvImportMessage("Choose a CSV file first.");
      return;
    }

    const now = new Date().toISOString();
    const { nextClients, nextCampaigns, importClient, importCampaign } = ensureImportContext(snapshot);
    const nextCategories = [...snapshot.categories];
    const existingLeadKeys = new Set(
      snapshot.leads.map((lead) => `${lead.businessName.toLowerCase()}|${lead.phone.replace(/[^\d]/g, "")}|${lead.city.toLowerCase()}`)
    );
    const existingScriptKeys = new Set(
      snapshot.scripts.map((script) => `${script.title.toLowerCase()}|${script.campaignId ?? ""}`)
    );

    const addedLeads: Lead[] = [];
    const addedLogs: ActivityLog[] = [];
    const addedScripts: Script[] = [];

    csvInfo.allObjects.forEach((row, index) => {
      const name = row.title || row.name || row.business_name || "";
      if (!name.trim()) return;

      const phone = getImportedPhone(row);
      const normalizedPhone = phone.replace(/[^\d]/g, "");
      const city = getImportedCity(row, phone);
      const duplicateKey = `${name.toLowerCase()}|${normalizedPhone}|${city.toLowerCase()}`;
      if (existingLeadKeys.has(duplicateKey)) return;

      const rawCategory = normalizeGeneratedCategory(getCategoryCandidates(row)[0] || "");

      const autoCategory = classifyText(
        [
          name,
          row.categoryname,
          row.categories?.replace(/\//g, " "),
          row.address,
          row.street,
          row.city,
          row.state,
          row.website,
          row.neighborhood,
          row.categories?.replace(/\//g, " ")
        ]
          .filter(Boolean)
          .join(" "),
        nextCategories
      );

      const finalCategory = titleCase(
        rawCategory
        || (aiPrefs.autoCategorizeImportedLeads && autoCategory !== "Unmatched" ? autoCategory : "")
        || importClient.niche
        || "General"
      );

      if (
        aiPrefs.autoCreateCategories
        && finalCategory
        && !nextCategories.some((category) => category.name.toLowerCase() === finalCategory.toLowerCase())
      ) {
        nextCategories.push({
          id: `cat-import-${Date.now()}-${index}`,
          name: finalCategory,
          color: "#b28cff",
          rules: buildCategoryRules(finalCategory)
        });
      }

      buildScriptsForCategory(finalCategory, importClient.id, importCampaign.id).forEach((script) => {
        const scriptKey = `${script.title.toLowerCase()}|${script.campaignId ?? ""}`;
        if (!existingScriptKeys.has(scriptKey)) {
          existingScriptKeys.add(scriptKey);
          addedScripts.push(script);
        }
      });

      existingLeadKeys.add(duplicateKey);

      const leadId = `lead-import-${Date.now()}-${index}`;
      const address = row.address || [row.street, row.city, row.state, row.postalcode, row.countrycode].filter(Boolean).join(", ");
      const website = row.website || "";
      const email = row.email || row.email_1 || row.emails || "";
      const notes = [
        address ? `Address: ${address}` : "",
        website ? `Website: ${website}` : "",
        email ? `Email: ${email}` : "",
        row.categories ? `Categories: ${row.categories}` : ""
      ]
        .filter(Boolean)
        .join("\n");

      addedLeads.push({
        id: leadId,
        clientId: importClient.id,
        campaignId: importCampaign.id,
        name,
        businessName: name,
        phone,
        email,
        address,
        city,
        niche: finalCategory,
        source: "CSV Import",
        whatsappStatus: whatsAppSettings.defaultStatus === "yes" || whatsAppSettings.defaultStatus === "no" ? whatsAppSettings.defaultStatus : "unknown",
        leadStage: formDefaults.defaultStage as LeadStage,
        priority: whatsAppSettings.markNoWhatsAppAsLowPriority ? "medium" : "high",
        tags: ["csv-import", finalCategory.toLowerCase().replace(/\s+/g, "-")],
        notes,
        aiSummary: `${name} was imported from CSV into ${importClient.name}. Check WhatsApp first, then qualify the opportunity fast.`,
        aiNextAction: "Check WhatsApp first and send a short direct opener tied to the business niche.",
        score: 52,
        lastContactedAt: "",
        nextFollowUpAt: "",
        createdAt: now,
        updatedAt: now,
        previousMessages: []
      });

      addedLogs.push({
        id: `log-import-${Date.now()}-${index}`,
        leadId,
        type: "import",
        content: `Imported from ${csvInfo.fileName} through Settings CSV import.`,
        createdAt: now
      });
    });

    if (!addedLeads.length) {
      setCsvImportMessage("No new leads were imported. The file was empty or everything matched existing leads.");
      return;
    }

    replaceSnapshot({
      ...snapshot,
      clients: nextClients,
      campaigns: nextCampaigns,
      leads: [...addedLeads, ...snapshot.leads],
      scripts: [...addedScripts, ...snapshot.scripts],
      categories: nextCategories,
      activityLogs: [...addedLogs, ...snapshot.activityLogs]
    });

    setCategories(nextCategories);
    setCsvImportMessage(
      `Imported ${addedLeads.length} lead${addedLeads.length === 1 ? "" : "s"}, created ${addedScripts.length} script${addedScripts.length === 1 ? "" : "s"}, and loaded everything into ${importClient.name} / ${importCampaign.name}.`
    );
  }

  function handleResetAllInfo() {
    if (resetArmed) {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
      setResetArmed(false);
      persistResetAllInfo();
      setCategories([]);
      setBackupMessage("All in-app settings info was reset. Import a CSV or backup to rebuild the state.");
      setCsvInfo({
        fileName: "No CSV chosen yet",
        headers: [],
        rows: [],
        sampleObjects: [],
        allObjects: []
      });
      setCsvImportMessage("All app data was reset. Choose a CSV file to rebuild the workspace.");
      setTestText("");
      setNewCategory({ name: "", color: "#68aefc", rules: "" });
      setAiPrefs({
        autoCreateCategories: true,
        autoCategorizeImportedLeads: true,
        autoGenerateLeadSummary: true,
        autoSuggestNextAction: true,
        preferredTone: "Direct and sharp",
        messageLength: "Short"
      });
      setWhatsAppSettings({
        forceWhatsAppFirst: true,
        defaultStatus: "unknown",
        markNoWhatsAppAsLowPriority: true
      });
      setLeadStages(defaultStages);
      setFormDefaults({
        defaultStage: "New",
        autoSummary: true,
        autoTagging: true,
        assignToSelectedCampaign: true
      });
      setDisplayPrefs({
        density: "Compact",
        mobileMode: "Field Console",
        accent: "LeadOS Lime"
      });
      return;
    }

    setResetArmed(true);
    setBackupMessage("Tap Reset All Info again within 5 seconds to confirm.");
    resetTimerRef.current = window.setTimeout(() => {
      setResetArmed(false);
      setBackupMessage("Choose a backup file to validate it before wiring persistence.");
    }, 5000);
  }

  return (
    <div className="stack">
      <input
        ref={backupInputRef}
        type="file"
        accept=".json"
        style={{ display: "none" }}
        onChange={handleBackupFile}
      />
      <input
        ref={csvInputRef}
        type="file"
        accept=".csv"
        style={{ display: "none" }}
        onChange={handleCsvFile}
      />

      <section className="card">
        <div className="section-head">
          <div>
            <div className="eyebrow">Backup and import</div>
            <h2>Keep the old safety nets</h2>
          </div>
        </div>
        <div className="button-row">
          <button className="ghost-button primary" type="button" onClick={exportBackup}>Export Backup</button>
          <button className="tiny-button" type="button" onClick={() => backupInputRef.current?.click()}>Import Backup File</button>
          <button className="ghost-button red" type="button" onClick={handleResetAllInfo}>
            {resetArmed ? "Tap Again to Reset All Info" : "Reset All Info"}
          </button>
        </div>
        <div className="text-list-item">{backupMessage}</div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <div className="eyebrow">CSV mapping settings</div>
            <h2>File-based import, not pasted text</h2>
          </div>
        </div>
        <div className="button-row">
          <button className="ghost-button primary" type="button" onClick={() => csvInputRef.current?.click()}>Choose CSV File</button>
          <button className="tiny-button" type="button" onClick={runAiCategoryCreation}>AI Create Categories From CSV</button>
          <button className="tiny-button" type="button" onClick={runCsvCategorization}>Run AI Categorization</button>
          <button className="ghost-button blue" type="button" onClick={importCsvIntoLeadOS}>Import CSV Into LeadOS</button>
        </div>
        <div className="text-list-item">Current file: {csvInfo.fileName}</div>
        <div className="text-list-item">{csvImportMessage}</div>
        <div className="mini-grid">
          <div className="mini-card">
            <strong>Headers</strong>
            <p>{csvInfo.headers.join(", ") || "No CSV chosen yet"}</p>
          </div>
          <div className="mini-card">
            <strong>Auto-category preview</strong>
            <p>{csvInfo.rows[0]?.join(" | ") ?? "No row preview yet"}</p>
          </div>
        </div>
        <div className="text-list">
          <div className="text-list-item">The importer expects OG-style CSV headers like `title`, `phone`, `city`, `categoryName`, `category_1` to `category_10`, `website`, and `email_1`.</div>
          <div className="text-list-item">Duplicate leads should be skipped during import, just like the old LeadOS flow.</div>
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <div className="eyebrow">Category settings</div>
            <h2>Category rules and auto-categorization</h2>
          </div>
        </div>
        <div className="toolbar-grid four-up">
          <input className="control-input" placeholder="Category name" value={newCategory.name} onChange={(event) => setNewCategory((current) => ({ ...current, name: event.target.value }))} />
          <input className="control-input" placeholder="Color" value={newCategory.color} onChange={(event) => setNewCategory((current) => ({ ...current, color: event.target.value }))} />
          <input className="control-input" placeholder="Rules: comma separated" value={newCategory.rules} onChange={(event) => setNewCategory((current) => ({ ...current, rules: event.target.value }))} />
          <button
            className="ghost-button primary"
            type="button"
            onClick={() => {
              if (!newCategory.name.trim()) return;
              const apply = (current: Category[]) => [
                ...current,
                {
                  id: `cat-${Date.now()}`,
                  name: newCategory.name.trim(),
                  color: newCategory.color,
                  rules: newCategory.rules.split(",").map((rule) => rule.trim()).filter(Boolean)
                }
              ];
              setCategories(apply);
              updateCategories(apply);
              setNewCategory({ name: "", color: "#68aefc", rules: "" });
            }}
          >
            Add Category
          </button>
        </div>
        <div className="text-list">
          {categories.map((category) => (
            <div key={category.id} className="text-list-item">
              <strong>{category.name}</strong>
              <br />
              Rules: {category.rules.join(", ")}
            </div>
          ))}
        </div>
        <div className="mini-grid">
          <div className="mini-card">
            <strong>Test text</strong>
            <textarea className="notes-box compact-textarea" value={testText} onChange={(event) => setTestText(event.target.value)} />
          </div>
          <div className="mini-card">
            <strong>Detected category</strong>
            <p>{detectedCategory}</p>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <div className="eyebrow">AI preferences</div>
            <h2>Let AI create and apply category logic</h2>
          </div>
        </div>
        <div className="mini-grid">
          <div className="mini-card">
            <strong>Auto-create categories</strong>
            <p>{aiPrefs.autoCreateCategories ? "Enabled" : "Disabled"}</p>
          </div>
          <div className="mini-card">
            <strong>Auto-categorize imports</strong>
            <p>{aiPrefs.autoCategorizeImportedLeads ? "Enabled" : "Disabled"}</p>
          </div>
          <div className="mini-card">
            <strong>Lead summaries</strong>
            <p>{aiPrefs.autoGenerateLeadSummary ? "Enabled" : "Disabled"}</p>
          </div>
          <div className="mini-card">
            <strong>Next-action suggestions</strong>
            <p>{aiPrefs.autoSuggestNextAction ? "Enabled" : "Disabled"}</p>
          </div>
        </div>
        <div className="button-row">
          <button className="tiny-button" type="button" onClick={() => setAiPrefs((current) => ({ ...current, autoCreateCategories: !current.autoCreateCategories }))}>Toggle auto-create</button>
          <button className="tiny-button" type="button" onClick={() => setAiPrefs((current) => ({ ...current, autoCategorizeImportedLeads: !current.autoCategorizeImportedLeads }))}>Toggle auto-categorize</button>
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <div className="eyebrow">Lead stage customization</div>
            <h2>Current stage set</h2>
          </div>
        </div>
        <div className="text-list">
          {leadStages.map((stage) => (
            <div key={stage} className="text-list-item">{stage}</div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <div className="eyebrow">WhatsApp behavior settings</div>
            <h2>Keep the system WhatsApp-first</h2>
          </div>
        </div>
        <div className="mini-grid">
          <div className="mini-card"><strong>Force WhatsApp first</strong><p>{whatsAppSettings.forceWhatsAppFirst ? "Enabled" : "Disabled"}</p></div>
          <div className="mini-card"><strong>Default WA status</strong><p>{whatsAppSettings.defaultStatus}</p></div>
          <div className="mini-card"><strong>No WhatsApp fallback</strong><p>{whatsAppSettings.markNoWhatsAppAsLowPriority ? "Lower priority" : "No change"}</p></div>
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <div className="eyebrow">Form defaults</div>
            <h2>Instant form behavior</h2>
          </div>
        </div>
        <div className="mini-grid">
          <div className="mini-card"><strong>Default stage</strong><p>{formDefaults.defaultStage}</p></div>
          <div className="mini-card"><strong>Auto summary</strong><p>{formDefaults.autoSummary ? "Enabled" : "Disabled"}</p></div>
          <div className="mini-card"><strong>Auto tagging</strong><p>{formDefaults.autoTagging ? "Enabled" : "Disabled"}</p></div>
          <div className="mini-card"><strong>Assign to selected campaign</strong><p>{formDefaults.assignToSelectedCampaign ? "Enabled" : "Disabled"}</p></div>
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <div className="eyebrow">Theme and display</div>
            <h2>Operator display defaults</h2>
          </div>
        </div>
        <div className="mini-grid">
          <div className="mini-card"><strong>Density</strong><p>{displayPrefs.density}</p></div>
          <div className="mini-card"><strong>Mobile mode</strong><p>{displayPrefs.mobileMode}</p></div>
          <div className="mini-card"><strong>Accent</strong><p>{displayPrefs.accent}</p></div>
          <div className="mini-card"><strong>Legacy sync path</strong><p>Backup/export bridge</p></div>
        </div>
      </section>
    </div>
  );
}
